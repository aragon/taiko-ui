import { useState, useEffect } from "react";
import { useBlockNumber, usePublicClient, useReadContract } from "wagmi";
import { getAbiItem } from "viem";
import { EmergencyMultisigPluginAbi } from "@/plugins/emergencyMultisig/artifacts/EmergencyMultisigPlugin";
import { Proposal, IAction, RawAction, ProposalMetadata } from "@/utils/types";
import { EncryptedProposalMetadata, ProposalResultType } from "@/plugins/emergencyMultisig/utils/types";
import { PUB_CHAIN, PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { useDecryptedData } from "./useDecryptedData";
import { useIpfsJsonData } from "@/hooks/useMetadata";
import { useAction } from "@/hooks/useAction";

const ProposalCreatedEvent = getAbiItem({
  abi: EmergencyMultisigPluginAbi,
  name: "ProposalCreated",
});

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

export function useProposal(proposalId: string, autoRefresh = false) {
  const publicClient = usePublicClient();
  const [proposalCreationEvent, setProposalCreationEvent] = useState<ProposalCreatedLogResponse["args"]>();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Proposal on-chain data
  const {
    data: proposalResult,
    error: proposalError,
    fetchStatus: proposalFetchStatus,
    refetch: proposalRefetch,
  } = useReadContract({
    address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
    abi: EmergencyMultisigPluginAbi,
    functionName: "getProposal",
    args: [BigInt(proposalId)],
    chainId: PUB_CHAIN.id,
  });

  const proposalData = decodeProposalResultData(proposalResult);

  useEffect(() => {
    if (autoRefresh) proposalRefetch();
  }, [blockNumber]);

  // JSON data
  const {
    data: encryptedProposalData,
    isLoading: metadataLoading,
    error: metadataError,
  } = useIpfsJsonData<EncryptedProposalMetadata>(proposalData?.encryptedPayloadUri);

  // Decrypt metadata and actions
  const { privateActions, privateMetadata } = useDecryptedData(encryptedProposalData);

  const proposal = arrangeProposalData(
    proposalData,
    privateActions || undefined,
    proposalCreationEvent,
    privateMetadata || undefined
  );

  useEffect(() => {
    if (!proposalData || !publicClient || proposalCreationEvent) return;

    publicClient
      .getLogs({
        address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
        event: ProposalCreatedEvent as any,
        args: {
          proposalId,
        } as any,
        fromBlock: proposalData.parameters.snapshotBlock,
        toBlock: "latest",
      })
      .then((logs) => {
        if (!logs || !logs.length) throw new Error("No creation logs");

        const log: ProposalCreatedLogResponse = logs[0] as any;
        setProposalCreationEvent(log.args);
      })
      .catch((err) => {
        console.error("Could not fetch the proposal details", err);
        return null;
      });
  }, [proposalData, !!publicClient]);

  return {
    proposal,
    refetch: proposalRefetch,
    status: {
      proposalReady: proposalFetchStatus === "idle",
      proposalLoading: proposalFetchStatus === "fetching",
      proposalError,
      metadataReady: !metadataError && !metadataLoading && !!privateMetadata,
      metadataLoading,
      metadataError: metadataError !== undefined,
    },
  };
}

// Helpers

function decodeProposalResultData(data?: ProposalResultType) {
  if (!data?.length) return null;

  return {
    executed: data[0],
    approvals: data[1],
    parameters: data[2],
    encryptedPayloadUri: data[3],
    destActionsHash: data[4],
    destinationPlugin: data[5],
  };
}

function getProposalActions(chainActions: readonly RawAction[]): IAction[] {
  if (!chainActions) return [];

  return chainActions.map((tx) => {
    const { data, to, value } = tx;
    const rawAction = { data, to, value };
    const decoded = useAction(tx);

    return { raw: rawAction, decoded };
  });
}

function arrangeProposalData(
  proposalData?: ReturnType<typeof decodeProposalResultData>,
  actions?: readonly RawAction[],
  creationEvent?: ProposalCreatedLogResponse["args"],
  metadata?: ProposalMetadata
): Proposal | null {
  if (!proposalData) return null;

  return {
    actions: actions ? getProposalActions(actions) : [],
    executed: proposalData.executed,
    parameters: {
      snapshotBlock: proposalData.parameters.snapshotBlock,
      startDate: BigInt(0),
      endDate: proposalData.parameters.expirationDate,
      minApprovals: proposalData.parameters.minApprovals,
    },
    approvals: proposalData.approvals,
    allowFailureMap: BigInt(0),
    creator: creationEvent?.creator || "",
    title: metadata?.title || "",
    summary: metadata?.summary || "",
    description: metadata?.description || "",
    resources: metadata?.resources || [],
  };
}
