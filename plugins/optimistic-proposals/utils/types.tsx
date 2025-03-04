import type { Address, Hex } from "viem";
import type { IProposalResource, RawAction } from "@/utils/types";

export type ProposalInputs = {
  proposalId: bigint;
};

export type OptimisticProposalResultType = readonly [
  boolean,
  boolean,
  OptimisticProposalParameters,
  bigint,
  Hex,
  readonly RawAction[],
  bigint,
];

export type OptimisticProposalParameters = {
  vetoStartDate?: bigint; // Not present when receiving the contract params. Available otherwise.
  vetoEndDate: bigint;
  snapshotTimestamp: bigint;
  minVetoRatio: number;
  unavailableL2: boolean;
};

export type OptimisticProposal = {
  index: number;
  active: boolean;
  executed: boolean;
  parameters: OptimisticProposalParameters;
  vetoTally: bigint;
  actions: RawAction[];
  allowFailureMap: bigint;
  creator: string;
  title: string;
  summary: string;
  description: string;
  resources: IProposalResource[];
};

export type VetoCastEvent = {
  voter: Address;
  proposalId: bigint;
  votingPower: bigint;
};
