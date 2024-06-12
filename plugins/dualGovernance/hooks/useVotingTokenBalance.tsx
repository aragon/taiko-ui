import { useReadContract } from "wagmi";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { Erc20VotesAbi } from "../artifacts/ERC20Votes";
import { Address } from "viem";

export function useVotingTokenBalance(address: Address, timestamp: bigint) {
  const {
    data: balance,
    isError: isError,
    isLoading: isLoading,
  } = useReadContract({
    address: PUB_TOKEN_ADDRESS,
    abi: Erc20VotesAbi,
    functionName: "getPastVotes",
    args: [address, timestamp],
  });

  return {
    balance: balance || BigInt("0"),
    status: {
      isLoading: isLoading,
      isError: isError,
    },
  };
}
