import { useEffect } from "react";
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useProposal } from "./useProposal";
import { useUserCanApprove } from "@/plugins/emergencyMultisig/hooks/useUserCanApprove";
import { EmergencyMultisigPluginAbi } from "@/plugins/emergencyMultisig/artifacts/EmergencyMultisigPlugin";
import { useAlerts, AlertContextProps } from "@/context/Alerts";
import { PUB_CHAIN, PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { useProposalApprovals } from "./useProposalApprovals";
import { useRouter } from "next/router";

export function useProposalApprove(proposalId: string) {
  const { push } = useRouter();
  const publicClient = usePublicClient({ chainId: PUB_CHAIN.id });

  const { proposal, status: proposalFetchStatus, refetch: refetchProposal } = useProposal(proposalId, true);
  const approvals = useProposalApprovals(publicClient!, PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS, proposalId, proposal);

  const { addAlert } = useAlerts() as AlertContextProps;
  const {
    writeContract: approveWrite,
    data: approveTxHash,
    error: approveError,
    status: approveStatus,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { canApprove, refetch: refetchCanApprove } = useUserCanApprove(proposalId);

  useEffect(() => {
    if (approveStatus === "idle" || approveStatus === "pending") return;
    else if (approveStatus === "error") {
      if (approveError?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        console.error(approveError);
        addAlert("Could not approve the proposal", { type: "error" });
      }
      return;
    }

    // success
    if (!approveTxHash) return;
    else if (isConfirming) {
      addAlert("Approval submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: approveTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Approval registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: approveTxHash,
    });
    setTimeout(() => push("#/"), 1000 * 2);
    refetchCanApprove();
    refetchProposal();
  }, [approveStatus, approveTxHash, isConfirming, isConfirmed]);

  const approveProposal = () => {
    approveWrite({
      abi: EmergencyMultisigPluginAbi,
      address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
      functionName: "approve",
      args: [BigInt(proposalId)],
    });
  };

  return {
    proposal,
    proposalFetchStatus,
    approvals,
    canApprove: !!canApprove,
    isConfirming: approveStatus === "pending" || isConfirming,
    isConfirmed,
    approveProposal,
  };
}
