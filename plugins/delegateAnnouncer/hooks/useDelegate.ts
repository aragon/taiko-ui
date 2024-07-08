import { iVotesAbi } from "../artifacts/iVotes.sol";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { type Address } from "viem";
import { useReadContract } from "wagmi";

/** Returns the delegate (if any) for the given address */
export const useDelegate = (address?: Address, options = {}) => {
  const {
    data: delegate,
    isLoading,
    isError,
  } = useReadContract({
    address: PUB_TOKEN_ADDRESS,
    abi: iVotesAbi,
    functionName: "delegates",
    args: [address!],
    query: { enabled: !!address, ...options },
  });

  return {
    delegate,
    isLoading,
    isError,
  };
};
