import { AvatarIcon, Breadcrumbs, Button, Heading, IBreadcrumbsLink, IconType, Tag, TagVariant } from "@aragon/ods";
import { Publisher } from "@/components/publisher";
import classNames from "classnames";
import { ReactNode } from "react";
import { OptimisticProposal } from "@/plugins/dualGovernance/utils/types";
import { useProposalStatus } from "@/plugins/dualGovernance/hooks/useProposalVariantStatus";
import dayjs from "dayjs";

import { getSimpleRelativeTimeFromDate } from "@/utils/dates";

const DEFAULT_PROPOSAL_TITLE = "(No proposal title)";
const DEFAULT_PROPOSAL_SUMMARY = "(No proposal summary)";

interface ProposalHeaderProps {
  proposal: OptimisticProposal;
  canExecute: boolean;
  breadcrumbs: IBreadcrumbsLink[];
  transactionConfirming: boolean;
  onExecutePressed: () => void;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  proposal,
  canExecute,
  breadcrumbs,
  transactionConfirming,
  onExecutePressed,
}) => {
  const status = useProposalStatus(proposal);
  const tagVariant = getTagVariantFromStatus(status);

  // TODO: Remake this logic with something less hacky
  const isEmergency = proposal.parameters.vetoStartDate === 0n;

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
            <Heading size="h1">{proposal.title || DEFAULT_PROPOSAL_TITLE}</Heading>
            {isEmergency && <Tag label="Emergency" variant="critical" />}
          </div>
          <p className="text-lg leading-normal text-neutral-500">{proposal.summary || DEFAULT_PROPOSAL_SUMMARY}</p>
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

const getTagVariantFromStatus = (status: string | undefined): TagVariant => {
  switch (status) {
    case "accepted":
      return "success";
    case "active":
      return "info";
    case "challenged":
      return "warning";
    case "draft":
      return "neutral";
    case "executed":
      return "success";
    case "expired":
      return "critical";
    case "failed":
      return "critical";
    case "partiallyExecuted":
      return "warning";
    case "pending":
      return "neutral";
    case "queued":
      return "success";
    case "rejected":
      return "critical";
    case "vetoed":
      return "warning";
    default:
      return "neutral";
  }
};
