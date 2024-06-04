import { AccordionContainer, Card, Heading } from "@aragon/ods";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import React from "react";
import { VotingStage, type IVotingStageProps } from "./votingStage/votingStage";
import { ITransformedStage } from "@/utils/types";

dayjs.extend(utc);
dayjs.extend(relativeTime);

interface IProposalVotingProps {
  stages: ITransformedStage[];
}

export const ProposalVoting: React.FC<IProposalVotingProps> = ({ stages }) => {
  return (
    <Card className="overflow-hidden rounded-xl bg-neutral-0 shadow-neutral">
      {/* Header */}
      <div className="flex flex-col gap-y-2 p-6">
        <Heading size="h2">Voting</Heading>
        <p className="text-lg leading-normal text-neutral-500">
          The onchain multisig process allows for the Members to create proposals that if approve will be moved to the
          Optimistic Proposal Stage.
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
