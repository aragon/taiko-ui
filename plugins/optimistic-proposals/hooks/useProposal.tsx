import { useEffect } from "react";
import { useBlockNumber, usePublicClient, useReadContract } from "wagmi";
import { getAbiItem } from "viem";
import { ProposalMetadata, type RawAction, type DecodedAction } from "@/utils/types";
import {
  type OptimisticProposal,
  type OptimisticProposalParameters,
  type OptimisticProposalResultType,
} from "@/plugins/optimistic-proposals/utils/types";
import { PUB_CHAIN, PUB_DEPLOYMENT_BLOCK, PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS } from "@/constants";
import { useMetadata } from "@/hooks/useMetadata";
import { TaikoOptimisticTokenVotingPluginAbi } from "../artifacts/TaikoOptimisticTokenVotingPlugin.sol";
import { parseProposalId } from "../utils/proposal-id";
import { getLogsUntilNow } from "@/utils/evm";
import { useQuery } from "@tanstack/react-query";

const ProposalCreatedEvent = getAbiItem({
  abi: TaikoOptimisticTokenVotingPluginAbi,
  name: "ProposalCreated",
});

export function useProposal(proposalId?: bigint, autoRefresh = false) {
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Proposal onchain data
  const {
    data: proposalResult,
    error: proposalError,
    fetchStatus: proposalFetchStatus,
    refetch: proposalRefetch,
  } = useReadContract({
    address: PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
    abi: TaikoOptimisticTokenVotingPluginAbi,
    functionName: "getProposal",
    args: [proposalId ?? BigInt(0)],
    chainId: PUB_CHAIN.id,
  });
  const { data: proposalCreationEvent } = useProposalCreationEvent(proposalId);

  const proposalData = decodeProposalResultData(proposalResult);

  useEffect(() => {
    if (autoRefresh) proposalRefetch();
  }, [blockNumber]);

  // JSON metadata
  const {
    data: metadataContent,
    isLoading: metadataLoading,
    error: metadataError,
  } = useMetadata<ProposalMetadata>(proposalData?.metadataUri);

  const proposal = arrangeProposalData(proposalId, proposalData, proposalCreationEvent, metadataContent);

  return {
    proposal,
    refetch: proposalRefetch,
    status: {
      proposalReady: proposalFetchStatus === "idle",
      proposalLoading: proposalFetchStatus === "fetching",
      proposalError,
      metadataReady: !metadataError && !metadataLoading && !!metadataContent,
      metadataLoading,
      metadataError: metadataError !== undefined,
    },
  };
}

// Helpers

function useProposalCreationEvent(proposalId: bigint | undefined) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: [
      "optimistic-proposal-creation-event",
      PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
      proposalId?.toString() || "",
      !!publicClient,
    ],
    queryFn: () => {
      if (!publicClient || typeof proposalId === "undefined") throw new Error("Not ready");

      return getLogsUntilNow(
        PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
        ProposalCreatedEvent,
        {
          proposalId: BigInt(proposalId),
        },
        publicClient,
        PUB_DEPLOYMENT_BLOCK
      ).then((logs) => {
        if (!logs || !logs.length) throw new Error("No creation logs");

        return logs[0].args;
      });
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 10,
  });
}

function decodeProposalResultData(data?: OptimisticProposalResultType) {
  if (!data?.length || data.length < 6) return null;

  return {
    active: data[0] as boolean,
    executed: data[1] as boolean,
    parameters: data[2] as OptimisticProposalParameters,
    vetoTally: data[3] as bigint,
    metadataUri: data[4] as string,
    actions: data[5] as Array<RawAction>,
    allowFailureMap: data[6] as bigint,
  };
}

function arrangeProposalData(
  proposalId?: bigint,
  proposalData?: ReturnType<typeof decodeProposalResultData>,
  creationEvent?: ReturnType<typeof useProposalCreationEvent>["data"],
  metadata?: ProposalMetadata
): OptimisticProposal | null {
  if (!proposalData || !proposalId) return null;

  const { index, startDate: vetoStartDate, endDate: vetoEndDate } = parseProposalId(proposalId);

  return {
    index,
    actions: proposalData.actions,
    active: proposalData.active,
    executed: proposalData.executed,
    parameters: {
      minVetoRatio: proposalData.parameters.minVetoRatio,
      skipL2: proposalData.parameters.skipL2,
      snapshotTimestamp: proposalData.parameters.snapshotTimestamp,
      vetoStartDate,
      vetoEndDate,
    },
    vetoTally: proposalData.vetoTally,
    allowFailureMap: proposalData.allowFailureMap,
    creator: creationEvent?.creator ?? "",
    title: metadata?.title ?? "",
    summary: metadata?.summary ?? "",
    description: metadata?.description ?? "",
    resources: metadata?.resources ?? [],
  };
}
