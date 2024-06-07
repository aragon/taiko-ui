import { useEffect } from "react";
import { Hex } from "viem";
import { PublicKeyRegistryAbi } from "../artifacts/PublicKeyRegistry";
import { useConfig, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { uint8ArrayToHex } from "@/utils/hex";
import { useDerivedWallet } from "./useDerivedWallet";

export function usePublicKeyRegistry() {
  const config = useConfig();
  const { writeContract, status: registrationStatus } = useWriteContract();
  const { publicKey, requestSignature } = useDerivedWallet();

  const { data, isLoading, isSuccess, error, refetch } = useQuery({
    queryKey: ["public-key-registry-values"],
    queryFn: () => {
      return readContract(config, {
        abi: PublicKeyRegistryAbi,
        address: PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS,
        functionName: "getRegisteredWallets",
      }).then((addresses) => {
        return Promise.all(
          addresses.map((addr) => {
            return readContract(config, {
              abi: PublicKeyRegistryAbi,
              address: PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS,
              functionName: "publicKeys",
              args: [addr],
            });
          })
        ).then((publicKeys: Hex[]) => {
          return { addresses, publicKeys };
        });
      });
    },
    initialData: {
      publicKeys: [],
      addresses: [],
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 10,
  });

  const registerPublicKey = async () => {
    let pubK: Uint8Array | undefined = publicKey;
    if (!pubK) {
      const keys = await requestSignature();
      pubK = keys.publicKey;
    }

    writeContract({
      abi: PublicKeyRegistryAbi,
      address: PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS,
      functionName: "setPublicKey",
      args: [uint8ArrayToHex(pubK)],
    });
  };

  useEffect(() => {
    refetch();
  }, [registrationStatus]);

  return {
    data,
    registerPublicKey,
    isLoading,
    isSuccess,
    error,
  };
}
