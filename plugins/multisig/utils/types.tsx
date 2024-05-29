import { Address } from "viem";
import { Action } from "@/utils/types";

export type ProposalInputs = {
  proposalId: bigint;
};

export type ProposalResultType = readonly [boolean, number, ProposalParameters, readonly Action[], bigint];

export type ProposalParameters = {
  startDate: bigint;
  endDate: bigint;
  snapshotBlock: bigint;
  minApprovals: number;
};

export type Proposal = {
  // active: boolean;
  executed: boolean;
  parameters: ProposalParameters;
  approvals: number;
  actions: Action[];
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
