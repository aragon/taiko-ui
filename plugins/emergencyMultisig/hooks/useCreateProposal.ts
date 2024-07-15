import { useRouter } from "next/router";
import { useEncryptedData } from "./useEncryptedData";
import { useEffect, useState } from "react";
import { ActionType, ProposalMetadata, RawAction } from "@/utils/types";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useAlerts } from "@/context/Alerts";
import {
  PUB_APP_NAME,
  PUB_CHAIN,
  PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
  PUB_PROJECT_URL,
} from "@/constants";
import { uploadToPinata } from "@/utils/ipfs";
import { EmergencyMultisigPluginAbi } from "../artifacts/EmergencyMultisigPlugin";
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
  const [actionType, setActionType] = useState<ActionType>(ActionType.Signaling);
  const { encryptProposalData } = useEncryptedData();

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

    // Check the action
    switch (actionType) {
      case ActionType.Signaling:
        break;
      case ActionType.Withdrawal:
        if (!actions.length) {
          return addAlert("Invalid proposal details", {
            description: "Please ensure that the withdrawal address and the amount to transfer are valid",
            type: "error",
          });
        }
        break;
      default:
        if (!actions.length || !actions[0].data || actions[0].data === "0x") {
          return addAlert("Invalid proposal details", {
            description: "Please ensure that the values of the action to execute are complete and correct",
            type: "error",
          });
        }
    }

    try {
      setIsCreating(true);
      const privateMetadata: ProposalMetadata = {
        title,
        summary,
        description,
        resources: [{ name: PUB_APP_NAME, url: PUB_PROJECT_URL }],
      };

      // Encrypt the proposal data
      const { payload: publicMetadataJson, hashed } = await encryptProposalData(privateMetadata, actions);

      const publicMetadataUri = await uploadToPinata(JSON.stringify(publicMetadataJson));

      createProposalWrite({
        chainId: PUB_CHAIN.id,
        abi: EmergencyMultisigPluginAbi,
        address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
        functionName: "createProposal",
        args: [toHex(publicMetadataUri), hashed.metadataUri, hashed.actions, PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS, false],
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
    actionType,
    setTitle,
    setSummary,
    setDescription,
    setActions,
    setActionType,
    submitProposal,
  };
}
