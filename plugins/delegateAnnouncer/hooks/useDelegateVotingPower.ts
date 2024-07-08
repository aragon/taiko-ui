import { iVotesAbi } from "../artifacts/iVotes.sol";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { useCallback, useEffect } from "react";
import { type Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useDelegateVotingPower = (mode: "delegate" | "claim" = "delegate", onSuccess?: () => void) => {
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
        logger.error(`Could not ${mode} voting power`, error);
        addAlert(`Could not ${mode} voting power`, { type: "error" });
      }
      return;
    }

    // success
    if (!hash) return;
    else if (isConfirming) {
      addAlert("Delegation submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: hash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Delegation registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: hash,
    });

    onSuccess?.();
  }, [status, hash, isConfirming, isConfirmed]);

  const delegateVotingPower = useCallback(
    async (address: Address | undefined) => {
      if (address) {
        writeContract({
          abi: iVotesAbi,
          address: PUB_TOKEN_ADDRESS,
          functionName: "delegate",
          args: [address],
        });
      }
    },
    [writeContract]
  );

  return {
    delegateVotingPower,
    isConfirmed,
    isConfirming,
    status,
  };
};
