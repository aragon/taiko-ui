import { useConfig, usePublicClient } from "wagmi";
import { SignerListAbi } from "../artifacts/SignerList";
import { PUB_SIGNER_LIST_CONTRACT_ADDRESS } from "@/constants";
import { Address, PublicClient, getAbiItem } from "viem";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

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

    Promise.all([fetchAddedMembers(publicClient), fetchRemovedMembers(publicClient)])
      .then(([added, removed]) => {
        const result = computeFinalList(added, removed);

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

export function useEncryptionRecipients() {
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

// Helpers

function fetchAddedMembers(publicClient: PublicClient): Promise<SignerAddRemoveItem[]> {
  return publicClient
    .getLogs({
      address: PUB_SIGNER_LIST_CONTRACT_ADDRESS,
      event: SignersAddedEvent,
      // args: {},
      fromBlock: BigInt(0),
      toBlock: "latest",
    })
    .then((logs) => {
      if (!logs) throw new Error("Empty response");

      return logs.map((item) => {
        return {
          blockNumber: item.blockNumber,
          added: item.args.signers || ([] as any),
          removed: [],
        };
      });
    });
}

function fetchRemovedMembers(publicClient: PublicClient): Promise<SignerAddRemoveItem[]> {
  return publicClient
    .getLogs({
      address: PUB_SIGNER_LIST_CONTRACT_ADDRESS,
      event: SignersRemovedEvent,
      // args: {},
      fromBlock: BigInt(0),
      toBlock: "latest",
    })
    .then((logs) => {
      if (!logs) throw new Error("Empty response");

      return logs.map((item) => {
        return {
          blockNumber: item.blockNumber,
          added: [],
          removed: item.args.signers || ([] as any),
        };
      });
    });
}

type SignerAddRemoveItem = {
  blockNumber: bigint;
  added: Address[];
  removed: Address[];
};

function computeFinalList(added: SignerAddRemoveItem[], removed: SignerAddRemoveItem[]) {
  const merged = added.concat(removed);
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
