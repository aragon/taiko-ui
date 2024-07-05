import { useEffect, useState } from "react";
import { useConfig, usePublicClient, useReadContract } from "wagmi";
import { DelegateAnnouncerAbi } from "@/plugins/delegateAnnouncer/artifacts/DelegateAnnouncer.sol";
import { Address, PublicClient, getAbiItem, fromHex, parseAbi } from "viem";
import { DelegateAnnounce } from "../utils/types";
import { PUB_CHAIN, PUB_DAO_ADDRESS, PUB_DELEGATION_WALL_CONTRACT_ADDRESS } from "@/constants";
import { readContract } from "@wagmi/core";

export function useDelegateAnnouncements() {
  const config = useConfig();
  const publicClient = usePublicClient();
  const [candidateAddresses, setCandidateAddresses] = useState<Address[]>([]);
  const { data: candidateCount, status: isLoadingCandidateCount } = useReadContract({
    chainId: PUB_CHAIN.id,
    address: PUB_DAO_ADDRESS,
    abi: DelegateAnnouncerAbi,
    functionName: "candidateCount",
  });

  const [delegateAnnouncements, setDelegateAnnouncements] = useState<DelegateAnnounce[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   if (!publicClient || !candidateCount) return;

  //   Promise.all(
  //     new Array(Number(candidateCount)).fill(0).map((_, idx) => {
  //       return readContract(config, {
  //         abi: DelegateAnnouncerAbi,
  //         functionName: "candidateAddresses",
  //         args: [BigInt(idx)],
  //       });
  //     })
  //   );
  // }, [candidateCount]);

  // useEffect(() => {
  //   if (!publicClient) return;

  //   setIsLoading(true);
  //   publicClient
  //     .getLogs({
  //       address: PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
  //       event: AnnounceDelegationEvent,
  //       args: {
  //         dao: daoAddress,
  //       } as any,
  //       fromBlock: BigInt(0),
  //       toBlock: "latest",
  //     })
  //     .then((logs) => {
  //       const announcements = logs.map((log) => ({
  //         logIndex: log.logIndex,
  //         dao: log.args.dao ?? "0x",
  //         delegate: log.args.delegate ?? "0x",
  //         contentUri: fromHex(log.args.contentUri ?? "0x", "string"),
  //       }));
  //       setDelegateAnnouncements(announcements);
  //     })
  //     .catch((err) => {
  //       console.error("Could not fetch the delegates list", err);
  //       return null;
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  return { delegateAnnouncements, isLoading };
}
