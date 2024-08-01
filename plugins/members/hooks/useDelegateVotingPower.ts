import { iVotesAbi } from "../artifacts/iVotes.sol";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { useEffect } from "react";
import { type Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useDelegateVotingPower = (targetAddress: Address, onSuccess?: () => void) => {
  const { addAlert } = useAlerts();
  const { writeContract, data: hash, error, status } = useWriteContract();
  const { isLoading, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("The signature was declined", {
          description: "Nothing has been sent to the network",
          timeout: 4 * 1000,
        });
      } else {
        logger.error(`Could not delegate`, error);
        addAlert(`Could not delegate`, { type: "error" });
      }
      return;
    }

    // success
    if (!hash) return;
    else if (isLoading) {
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

    if (typeof onSuccess === "function") onSuccess();
  }, [status, hash, isLoading, isConfirmed]);

  const delegateVotingPower = () => {
    writeContract({
      abi: iVotesAbi,
      address: PUB_TOKEN_ADDRESS,
      functionName: "delegate",
      args: [targetAddress],
    });
  };

  return {
    delegateVotingPower,
    isConfirmed,
    isLoading,
    status,
  };
};
