import { AvatarIcon, Breadcrumbs, Button, Heading, IconType, Tag } from "@aragon/ods";
import { Publisher } from "@/components/publisher";
import classNames from "classnames";
import { ReactNode } from "react";
import { OptimisticProposal } from "@/plugins/dualGovernance/utils/types";
import { AlertVariant } from "@aragon/ods";
import { ElseIf, If, Then, Else } from "@/components/if";
import { AddressText } from "@/components/text/address";
import { useProposalVariantStatus } from "@/plugins/dualGovernance/hooks/useProposalVariantStatus";
import { PleaseWaitSpinner } from "@/components/please-wait";
import dayjs from "dayjs";

import { getSimpleRelativeTimeFromDate } from "@/utils/dates";

const DEFAULT_PROPOSAL_TITLE = "(No proposal title)";
const DEFAULT_PROPOSAL_SUMMARY = "(No proposal summary)";

interface ProposalHeaderProps {
  proposalIndex: number;
  proposal: OptimisticProposal;
  canVeto: boolean;
  canExecute: boolean;
  transactionConfirming: boolean;
  onVetoPressed: () => void;
  onExecutePressed: () => void;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  proposalIndex,
  proposal,
  canVeto,
  canExecute,
  breadcrumbs,
  transactionConfirming,
  onVetoPressed,
  onExecutePressed,
}) => {
  const proposalVariant = useProposalVariantStatus(proposal);
  const ended = proposal.parameters.vetoEndDate <= Date.now() / 1000;

  return (
    <div className="flex w-full justify-center bg-neutral-0">
      {/* Wrapper */}
      <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs}
          tag={
            status && {
              label: status,
              className: "capitalize",
              variant: tagVariant,
            }
          }
        />
        {/* Title & description */}
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex w-full items-center gap-x-4">
            <Heading size="h1">{proposal.title}</Heading>
            {/* && <Tag label="Emergency" variant="critical" />*/}
          </div>
          <p className="text-lg leading-normal text-neutral-500">{proposal.summary}</p>
        </div>
        {/* Metadata */}
        <div className="flex flex-wrap gap-x-10 gap-y-2">
          <div className="flex items-center gap-x-2">
            <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
            <Publisher publisher={[{ address: proposal.creator }]} />
          </div>
          <div className="flex items-center gap-x-2">
            <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
            <div className="flex gap-x-1 text-base leading-tight ">
              <span className="text-neutral-800">
                {getSimpleRelativeTimeFromDate(dayjs(Number(proposal.parameters.vetoEndDate) * 1000))}
              </span>
              <span className="text-neutral-500">left until expiration</span>
            </div>
          </div>
        </div>
      </MainSection>
    </div>
  );
};

export default ProposalHeader;

interface IMainSectionProps {
  children?: ReactNode;
  className?: string;
}
const MainSection: React.FC<IMainSectionProps> = (props) => {
  const { children, className } = props;

  return <div className={classNames("mx-auto w-full max-w-screen-xl px-4 py-6", className)}>{children}</div>;
};
