import { useRouter } from "next/router";
import { useEncryptedData } from "./useEncryptedData";
import { useEffect, useState } from "react";
import { ProposalMetadata, RawAction } from "@/utils/types";
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
import { URL_PATTERN } from "@/utils/input-values";
import { toHex } from "viem";

const UrlRegex = new RegExp(URL_PATTERN);

export function useCreateProposal() {
  const { push } = useRouter();
  const { addAlert } = useAlerts();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [actions, setActions] = useState<RawAction[]>([]);
  const [resources, setResources] = useState<{ name: string; url: string }[]>([
    { name: PUB_APP_NAME, url: PUB_PROJECT_URL },
  ]);
  const { writeContract: createProposalWrite, data: createTxHash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: createTxHash });
  const { encryptProposalData } = useEncryptedData();

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("The transaction signature was declined", {
          description: "Nothing will be sent to the network",
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
    if (!title.trim()) {
      return addAlert("Invalid proposal details", {
        description: "Please enter a title",
        type: "error",
      });
    }

    if (!summary.trim()) {
      return addAlert("Invalid proposal details", {
        description: "Please enter a summary of what the proposal is about",
        type: "error",
      });
    }

    for (const item of resources) {
      if (!item.name.trim()) {
        return addAlert("Invalid resource name", {
          description: "Please enter a name for all the resources",
          type: "error",
        });
      } else if (!UrlRegex.test(item.url.trim())) {
        return addAlert("Invalid resource URL", {
          description: "Please enter valid URL for all the resources",
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
        resources,
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
    resources,
    setTitle,
    setSummary,
    setDescription,
    setActions,
    setResources,
    submitProposal,
  };
}
