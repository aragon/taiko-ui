import { useReadContract } from "wagmi";
import { DelegateAnnouncerAbi } from "@/plugins/delegateAnnouncer/artifacts/DelegateAnnouncer.sol";
import { PUB_CHAIN, PUB_DELEGATION_WALL_CONTRACT_ADDRESS } from "@/constants";

/** Returns the list of delegates who posted a candidacy */
export function useDelegates() {
  const {
    data: delegates,
    status,
    refetch,
  } = useReadContract({
    chainId: PUB_CHAIN.id,
    address: PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
    abi: DelegateAnnouncerAbi,
    functionName: "getCandidateAddresses",
  });

  return { delegates, status, refetch };
}
