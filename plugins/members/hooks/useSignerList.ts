import { useConfig, usePublicClient } from "wagmi";
import { SignerListAbi } from "../artifacts/SignerList";
import { PUB_SIGNER_LIST_CONTRACT_ADDRESS } from "@/constants";
import { Address, getAbiItem, GetLogsReturnType } from "viem";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { getLogsUntilNow } from "@/utils/evm";

const SignersAddedEvent = getAbiItem({
  abi: SignerListAbi,
  name: "SignersAdded",
});
const SignersRemovedEvent = getAbiItem({
  abi: SignerListAbi,
  name: "SignersRemoved",
});

export function useSignerList() {
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signers, setSigners] = useState<Address[]>([]);

  // Creation event
  useEffect(() => {
    if (!publicClient) return;

    loadSigners();
  }, [!!publicClient]);

  const loadSigners = () => {
    if (!publicClient) {
      setError(new Error("No public client available"));
      return;
    }
    setIsLoading(true);

    const addedProm = getLogsUntilNow(PUB_SIGNER_LIST_CONTRACT_ADDRESS, SignersAddedEvent, publicClient);
    const removedProm = getLogsUntilNow(PUB_SIGNER_LIST_CONTRACT_ADDRESS, SignersRemovedEvent, publicClient);

    Promise.all([addedProm, removedProm])
      .then(([addedLogs, removedLogs]) => {
        const result = computeCurrentSignerList(addedLogs, removedLogs);

        setSigners(result);
        setIsLoading(false);
        setError(null);
      })
      .catch((err: any) => {
        console.error(err);
        setIsLoading(false);
        setError(new Error("Error: Could not retrieve the list of members"));
      });
  };

  return {
    signers,
    isLoading,
    error,
    refetch: loadSigners,
  };
}

export function useApproverWalletList() {
  const config = useConfig();

  return useQuery({
    queryKey: ["encryption-registry-recipients-fetch", PUB_SIGNER_LIST_CONTRACT_ADDRESS],
    queryFn: () =>
      readContract(config, {
        abi: SignerListAbi,
        address: PUB_SIGNER_LIST_CONTRACT_ADDRESS,
        functionName: "getEncryptionRecipients",
      }),
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 5,
  });
}

type SignerAddRemoveItem = {
  blockNumber: bigint;
  added: Address[];
  removed: Address[];
};

function computeCurrentSignerList(
  addedLogs: GetLogsReturnType<typeof SignersAddedEvent>,
  removedLogs: GetLogsReturnType<typeof SignersRemovedEvent>
) {
  const merged: Array<SignerAddRemoveItem> = addedLogs
    .map((item) => ({
      blockNumber: item.blockNumber,
      added: item.args.signers || ([] as any),
      removed: [],
    }))
    .concat(
      removedLogs.map((item) => ({
        blockNumber: item.blockNumber,
        added: [],
        removed: item.args.signers || ([] as any),
      }))
    );

  const result = [] as Address[];

  merged.sort((a, b) => {
    return Number(a.blockNumber - b.blockNumber);
  });

  for (const item of merged) {
    for (const addr of item.added) {
      if (!result.includes(addr)) result.push(addr);
    }
    for (const addr of item.removed) {
      const idx = result.indexOf(addr);
      if (idx >= 0) result.splice(idx, 1);
    }
  }
  return result;
}