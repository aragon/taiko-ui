import { useAccount, useConfig } from "wagmi";
import { PUB_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { MultisigPluginAbi } from "../artifacts/MultisigPlugin";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

export function useCanCreateProposal() {
  const { address } = useAccount();
  const config = useConfig();

  const {
    data: canCreate,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["is-member", PUB_MULTISIG_PLUGIN_ADDRESS, address],
    queryFn: () => {
      return readContract(config, {
        abi: MultisigPluginAbi,
        address: PUB_MULTISIG_PLUGIN_ADDRESS,
        functionName: "isMember",
        args: [address!],
      });
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  });

  return { canCreate, isLoading, error, refetch };
}
