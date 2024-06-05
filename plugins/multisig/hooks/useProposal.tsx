import { useState, useEffect } from "react";
import { useBlockNumber, usePublicClient, useReadContract } from "wagmi";
import { Address, Hex, fromHex, getAbiItem } from "viem";
import { MultisigPluginAbi } from "@/plugins/multisig/artifacts/MultisigPlugin";
import { Proposal, IAction, RawAction, ProposalMetadata } from "@/utils/types";
import { ProposalParameters, ProposalResultType } from "@/plugins/multisig/utils/types";
import { PUB_CHAIN, PUB_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { useMetadata } from "@/hooks/useMetadata";
import { useAction } from "@/hooks/useAction";

type ProposalCreatedLogResponse = {
  args: {
    actions: IAction[];
    allowFailureMap: bigint;
    creator: string;
    endDate: bigint;
    startDate: bigint;
    metadata: string;
    proposalId: bigint;
  };
};

const ProposalCreatedEvent = getAbiItem({
  abi: MultisigPluginAbi,
  name: "ProposalCreated",
});

export function useProposal(proposalId: string, autoRefresh = false) {
  const publicClient = usePublicClient();
  const [proposalCreationEvent, setProposalCreationEvent] = useState<ProposalCreatedLogResponse["args"]>();
  const [metadataUri, setMetadata] = useState<string>();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Proposal on-chain data
  const {
    data: proposalResult,
    error: proposalError,
    fetchStatus: proposalFetchStatus,
    refetch: proposalRefetch,
  } = useReadContract({
    address: PUB_MULTISIG_PLUGIN_ADDRESS,
    abi: MultisigPluginAbi,
    functionName: "getProposal",
    args: [BigInt(proposalId)],
    chainId: PUB_CHAIN.id,
  });

  const proposalData = decodeProposalResultData(proposalResult);

  useEffect(() => {
    if (autoRefresh) proposalRefetch();
  }, [blockNumber]);

  // Creation event
  useEffect(() => {
    if (!proposalData || !publicClient) return;

    publicClient
      .getLogs({
        address: PUB_MULTISIG_PLUGIN_ADDRESS,
        event: ProposalCreatedEvent as any,
        args: {
          proposalId,
        } as any,
        fromBlock: proposalData.parameters.snapshotBlock,
        toBlock: proposalData.parameters.startDate,
      })
      .then((logs) => {
        if (!logs || !logs.length) throw new Error("No creation logs");

        const log: ProposalCreatedLogResponse = logs[0] as any;
        setProposalCreationEvent(log.args);
        setMetadata(fromHex(log.args.metadata as Hex, "string"));
      })
      .catch((err) => {
        console.error("Could not fetch the proposal details", err);
        return null;
      });
  }, [proposalData?.approvals, !!publicClient]);

  // JSON metadata
  const {
    data: metadataContent,
    isLoading: metadataLoading,
    error: metadataError,
  } = useMetadata<ProposalMetadata>(metadataUri);

  const proposal = arrangeProposalData(proposalData, proposalCreationEvent, metadataContent);

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

function decodeProposalResultData(data?: ProposalResultType) {
  if (!data?.length) return null;

  return {
    executed: data[0] as boolean,
    approvals: data[1] as number,
    parameters: data[2] as ProposalParameters,
    actions: getProposalActions(data[3] as Array<RawAction>),
    allowFailureMap: data[4] as bigint,
  };
}

function getProposalActions(chainActions: RawAction[]): IAction[] {
  return chainActions.map((tx) => {
    const { data, to, value } = tx;
    const rawAction = { data, to, value };
    const decoded = useAction(tx);

    return { raw: rawAction, decoded };
  });
}

function arrangeProposalData(
  proposalData?: ReturnType<typeof decodeProposalResultData>,
  creationEvent?: ProposalCreatedLogResponse["args"],
  metadata?: ProposalMetadata
): Proposal | null {
  if (!proposalData) return null;

  return {
    actions: proposalData.actions,
    executed: proposalData.executed,
    parameters: proposalData.parameters,
    approvals: proposalData.approvals,
    allowFailureMap: proposalData.allowFailureMap,
    creator: creationEvent?.creator || "",
    title: metadata?.title || "",
    summary: metadata?.summary || "",
    description: metadata?.description || "",
    resources: metadata?.resources || [],
  };
}
