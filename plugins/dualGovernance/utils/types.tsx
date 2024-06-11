import { Address, Hex } from "viem";
import { RawAction } from "@/utils/types";

export type ProposalInputs = {
  proposalId: bigint;
};

export type ProposalResultType = readonly [
  boolean,
  boolean,
  ProposalParameters,
  bigint,
  Hex,
  readonly RawAction[],
  bigint,
];

export type ProposalParameters = {
  snapshotTimestamp: bigint;
  vetoEndDate: bigint;
  minVetoRatio: number;
  skipL2: boolean;
};

export type Proposal = {
  id: bigint;
  active: boolean;
  executed: boolean;
  parameters: ProposalParameters;
  vetoTally: bigint;
  actions: RawAction[];
  allowFailureMap: bigint;
  creator: string;
  title: string;
  summary: string;
  description: string;
  resources: string[];
};

export type ProposalMetadata = {
  title: string;
  summary: string;
  description: string;
  resources: string[];
};

export type VoteCastResponse = {
  args: VetoCastEvent[];
};

export type VetoCastEvent = {
  voter: Address;
  proposalId: bigint;
  votingPower: bigint;
};
