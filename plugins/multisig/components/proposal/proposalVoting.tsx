import { AccordionContainer, Card, Heading, IApprovalThresholdResult, IButtonProps } from "@aragon/ods";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import React from "react";
import { VotingStage, type IVotingStageProps } from "./votingStage/votingStage";
import { Proposal } from "../../utils/types";

dayjs.extend(utc);
dayjs.extend(relativeTime);

export enum ProposalStages {
  DRAFT = "Draft",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "gPOL Community Voting",
  COUNCIL_CONFIRMATION = "Protocol Council Confirmation",
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

export interface ITransformedStage<TType extends Proposal = Proposal> {
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
}

interface IProposalVotingProps {
  stages: ITransformedStage[];
}

export const ProposalVoting: React.FC<IProposalVotingProps> = ({ stages }) => {
  return (
    <Card className="w-full overflow-hidden rounded-xl bg-neutral-0 shadow-neutral">
      {/* Header */}
      <div className="flex flex-col gap-y-2 p-6">
        <Heading size="h2">Voting</Heading>
        <p className="text-lg leading-normal text-neutral-500">
          The proposal for the community to veto start here. Do your best!
        </p>
      </div>
      {/* Stages */}
      <AccordionContainer isMulti={true} className="border-t border-t-neutral-100">
        {stages.map((stage, index) => (
          <VotingStage key={stage.id} {...({ ...stage, number: index + 1 } as IVotingStageProps)} />
        ))}
      </AccordionContainer>
    </Card>
  );
};
