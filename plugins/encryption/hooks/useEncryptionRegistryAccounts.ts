import { EncryptionRegistryAbi } from "../artifacts/EncryptionRegistry";
import { useConfig } from "wagmi";
import { readContract } from "@wagmi/core";
import { PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export function useEncryptionRegistryAccounts() {
  const config = useConfig();

  return useQuery({
    queryKey: ["encryption-registry-members-fetch", PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS],
    queryFn: () => {
      return readContract(config, {
        abi: EncryptionRegistryAbi,
        address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
        functionName: "getRegisteredAccounts",
      }).then((accounts) => {
        return Promise.all(
          accounts.map((accountAddress) =>
            readContract(config, {
              abi: EncryptionRegistryAbi,
              address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
              functionName: "accounts",
              args: [accountAddress],
            }).then((result) => {
              // zip values
              const [appointedWallet, publicKey] = result;
              return { owner: accountAddress, appointedWallet, publicKey };
            })
          )
        );
      });
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 5,
  });
}
