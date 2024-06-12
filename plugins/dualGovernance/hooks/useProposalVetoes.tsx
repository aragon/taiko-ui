import { useState, useEffect } from "react";
import { Address, getAbiItem } from "viem";
import { PublicClient } from "viem";
import { OptimisticTokenVotingPluginAbi } from "@/plugins/dualGovernance/artifacts/OptimisticTokenVotingPlugin.sol";
import { VetoCastEvent, VoteCastResponse } from "@/plugins/dualGovernance/utils/types";

const event = getAbiItem({
  abi: OptimisticTokenVotingPluginAbi,
  name: "VetoCast",
});

export function useProposalVetoes(publicClient: PublicClient, address: Address, proposalId: bigint | undefined) {
  const [proposalLogs, setLogs] = useState<VetoCastEvent[]>([]);

  async function getLogs() {
    if (!proposalId) return;

    const logs: VoteCastResponse[] = (await publicClient.getLogs({
      address,
      event: event as any,
      args: {
        proposalId,
      } as any,
      toBlock: "latest", // TODO: Make this variable between 'latest' and proposal last block
    })) as any;

    const newLogs = logs.flatMap((log) => log.args);
    if (newLogs.length > proposalLogs.length) setLogs(newLogs);
  }

  useEffect(() => {
    getLogs();
  }, [proposalId]);

  return proposalLogs;
}
