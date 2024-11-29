import { getAbiItem } from "viem";
import { MultisigPluginAbi } from "../artifacts/MultisigPlugin";
import { getLogsUntilNow } from "@/utils/evm";
import { usePublicClient } from "wagmi";
import { PUB_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { useQuery } from "@tanstack/react-query";

const approvedEvent = getAbiItem({
  abi: MultisigPluginAbi,
  name: "Approved",
});

export function useProposalApprovals(proposalId: string, snapshotBlock: bigint | undefined) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: [
      "multisig-proposal-approved-event",
      PUB_MULTISIG_PLUGIN_ADDRESS,
      proposalId.toString(),
      snapshotBlock?.toString() || "",
      !!publicClient,
    ],
    queryFn: () => {
      if (!publicClient || !snapshotBlock) return [];

      return getLogsUntilNow(
        PUB_MULTISIG_PLUGIN_ADDRESS,
        approvedEvent,
        {
          proposalId: BigInt(proposalId),
        },
        publicClient,
        snapshotBlock
      ).then((logs) => {
        return logs.flatMap((log) => log.args);
      });
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 3,
  });
}
