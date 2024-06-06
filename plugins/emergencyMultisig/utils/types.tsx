import { Address, Hex } from "viem";
import { Action } from "@/utils/types";

export type ProposalInputs = {
  proposalId: bigint;
};

export type ProposalResultType = readonly [boolean, number, ProposalParameters, string, readonly Action[], Address];

export type ProposalParameters = {
  expirationDate: bigint;
  snapshotBlock: bigint;
  minApprovals: number;
};

export type EncryptedProposalMetadata = {
  encrypted: {
    metadata: string; // base64
    actions: string; // base64
    symmetricKeys: Hex[];
  };
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

export type ApprovedEventResponse = {
  args: ApprovedEvent[];
};

export type ApprovedEvent = {
  proposalId: bigint;
  approver: Address;
};
