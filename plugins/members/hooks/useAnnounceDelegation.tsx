import { DelegateAnnouncerAbi } from "../artifacts/DelegationWall.sol";
import { PUB_DELEGATION_WALL_CONTRACT_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { uploadToPinata } from "@/utils/ipfs";
import { useCallback, useEffect } from "react";
import { toHex } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { type IAnnouncementMetadata } from "../utils/types";

export function useAnnounceDelegation(onSuccess?: () => void) {
  const { addAlert } = useAlerts();
  const { writeContract, data: hash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error("Could not create delegate profile", error);
        addAlert("Could not create your delegate profile", { type: "error" });
      }
      return;
    }

    // success
    if (!hash) return;
    else if (isConfirming) {
      addAlert("Delegate profile submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: hash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Delegate profile registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: hash,
    });

    onSuccess?.();
  }, [status, hash, isConfirming, isConfirmed]);

  const announceDelegation = useCallback(
    async (metadata: IAnnouncementMetadata) => {
      if (!metadata) return;

      try {
        const ipfsUrl = await uploadToPinata(JSON.stringify(metadata));

        if (ipfsUrl) {
          writeContract({
            abi: DelegateAnnouncerAbi,
            address: PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
            functionName: "register",
            args: [toHex(ipfsUrl)],
          });
        }
      } catch (error) {
        logger.error("Could not upload delegate profile metadata to IPFS", error);
      }
    },
    [writeContract]
  );

  return {
    announceDelegation,
    isConfirmed,
    isConfirming,
    status,
  };
}
