import { IVotesDataListVariant } from "@/components/proposalVoting/votesDataList/votesDataListItemStructure";
import { IApprovalThresholdResult, IButtonProps, ProposalType } from "@aragon/ods";
import { Address, Hex, AbiFunction } from "viem";

type EvmValue = string | Hex | Address | number | bigint | boolean;

export interface DecodedAction {
  functionName: string | null;
  functionAbi: AbiFunction | null;
  args: EvmValue[];
}

export type RawAction = {
  to: string;
  value: bigint;
  data: string;
};

export interface IAction {
  decoded?: DecodedAction;
  raw: RawAction;
}

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

export type ProposalMetadata = {
  title: string;
  summary: string;
  description: string;
  resources: IProposalResource[];
};

export type IProposalResource = {
  name: string;
  url: string;
};

export type Proposal = {
  // active: boolean;
  executed: boolean;
  parameters: ProposalParameters;
  approvals: number;
  actions: IAction[];
  allowFailureMap: bigint;
  creator: string;
  title: string;
  summary: string;
  description: string;
  resources: IProposalResource[];
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
  votes: IVote[];
  proposalId?: string;
  providerId?: string;
  result?: IBreakdownApprovalThresholdResult;
  details?: IVotingStageDetails;
}

// General types

type JsonLiteral = string | number | boolean;
export type JsonValue = JsonLiteral | Record<string, JsonLiteral> | Array<JsonLiteral>;
