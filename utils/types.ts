import { IVotesDataListVariant } from "@/components/proposalVoting/votesDataList/votesDataListItemStructure";
import { IApprovalThresholdResult, IButtonProps, ProposalType } from "@aragon/ods";
import { Address, Hex } from "viem";

export type Action = {
  to: Address;
  value: bigint;
  data: Hex;
};

export interface IAlert {
  id: number;
  type: "success" | "info" | "error";
  message: string;
  description?: string;
  explorerLink?: string;
  dismissTimeout?: ReturnType<typeof setTimeout>;
}

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

export enum ProposalStages {
  DRAFT = "Draft",
  MULTISIG_APPROVAL = "Multisig Approval",
}

export type VotingCta = Pick<IButtonProps, "disabled" | "isLoading"> & {
  label?: string;
  onClick?: (value?: number) => void;
};

export interface IBreakdownApprovalThresholdResult extends IApprovalThresholdResult {
  cta?: VotingCta;
}

export interface IVotingStageDetails {
  censusBlock: number;
  startDate: string;
  endDate: string;
  strategy: string;
  options: string;
}

export interface IVote {
  address: Address;
  variant: IVotesDataListVariant;
}

export interface ITransformedStage<TType extends ProposalType = ProposalType> {
  id: string;
  type: ProposalStages;
  variant: TType;
  title: string;
  status: string;
  disabled: boolean;
  proposalId?: string;
  providerId?: string;
  result?: IBreakdownApprovalThresholdResult;
  details?: IVotingStageDetails;
  votes: IVote[];
}

// General types

type JsonLiteral = string | number | boolean;
export type JsonValue = JsonLiteral | Record<string, JsonLiteral> | Array<JsonLiteral>;
