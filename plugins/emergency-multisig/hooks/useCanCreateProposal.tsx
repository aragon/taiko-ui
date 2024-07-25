import { useAccount, useConfig } from "wagmi";
import { readContract } from "@wagmi/core";
import { PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { EmergencyMultisigPluginAbi } from "../artifacts/EmergencyMultisigPlugin";
import { useQuery } from "@tanstack/react-query";

export function useCanCreateProposal() {
  const { address } = useAccount();
  const config = useConfig();

  const {
    data: canCreate,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["is-member-emergency", PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS, address],
    queryFn: () => {
      return readContract(config, {
        abi: EmergencyMultisigPluginAbi,
        address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
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
