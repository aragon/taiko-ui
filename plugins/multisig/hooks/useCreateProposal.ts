import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useAlerts } from "@/context/Alerts";
import {
  PUB_APP_NAME,
  PUB_CHAIN,
  PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  PUB_MULTISIG_PLUGIN_ADDRESS,
  PUB_PROJECT_URL,
} from "@/constants";
import { uploadToPinata } from "@/utils/ipfs";
import { MultisigPluginAbi } from "../artifacts/MultisigPlugin";
import { toHex } from "viem";

export function useCreateProposal() {
  const { push } = useRouter();
  const { addAlert } = useAlerts();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [actions, setActions] = useState<RawAction[]>([]);
  const { writeContract: createProposalWrite, data: createTxHash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: createTxHash });

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        console.error(error);
        addAlert("Could not create the proposal", { type: "error" });
      }
      setIsCreating(false);
      return;
    }

    // success
    if (!createTxHash) return;
    else if (isConfirming) {
      addAlert("Proposal submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: createTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Proposal created", {
      description: "The transaction has been validated",
      type: "success",
      txHash: createTxHash,
    });
    setTimeout(() => {
      push("#/");
      window.scroll(0, 0);
    }, 1000 * 2);
  }, [status, createTxHash, isConfirming, isConfirmed]);

  const submitProposal = async () => {
    // Check metadata
    if (!title.trim())
      return addAlert("Invalid proposal details", {
        description: "Please, enter a title",
        type: "error",
      });

    if (!summary.trim())
      return addAlert("Invalid proposal details", {
        description: "Please, enter a summary of what the proposal is about",
        type: "error",
      });

    try {
      setIsCreating(true);
      const proposalMetadataJsonObject: ProposalMetadata = {
        title,
        summary,
        description,
        resources: [{ name: PUB_APP_NAME, url: PUB_PROJECT_URL }],
      };

      const ipfsPin = await uploadToPinata(JSON.stringify(proposalMetadataJsonObject));

      createProposalWrite({
        chainId: PUB_CHAIN.id,
        abi: MultisigPluginAbi,
        address: PUB_MULTISIG_PLUGIN_ADDRESS,
        functionName: "createProposal",
        args: [toHex(ipfsPin), actions, PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS, false],
      });
    } catch (err) {
      setIsCreating(false);
    }
  };

  return {
    isCreating: isCreating || isConfirming || status === "pending",
    title,
    summary,
    description,
    actions,
    setTitle,
    setSummary,
    setDescription,
    setActions,
    submitProposal,
  };
}
