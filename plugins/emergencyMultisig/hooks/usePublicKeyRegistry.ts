import { useEffect } from "react";
import { Address, Hex, keccak256 } from "viem";
import { PublicKeyRegistryAbi } from "../artifacts/PublicKeyRegistry";
import { useConfig, useWriteContract } from "wagmi";
import { readContract, signMessage } from "@wagmi/core";
import { DETERMINISTIC_EMERGENCY_PAYLOAD, PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { computePublicKey } from "@/utils/encryption/asymmetric";
import { hexToUint8Array, uint8ArrayToHex } from "@/utils/hex";

export function usePublicKeyRegistry() {
  const config = useConfig();
  const { writeContract, status: registrationStatus } = useWriteContract();

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
    const privateSignature = await signMessage(config, { message: DETERMINISTIC_EMERGENCY_PAYLOAD });
    const derivedPrivateKey = keccak256(privateSignature);
    const pubKey = computePublicKey(hexToUint8Array(derivedPrivateKey));

    writeContract({
      abi: PublicKeyRegistryAbi,
      address: PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS,
      functionName: "setPublicKey",
      args: [uint8ArrayToHex(pubKey)],
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
