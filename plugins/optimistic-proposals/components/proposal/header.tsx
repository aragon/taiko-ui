import {
  AvatarIcon,
  Breadcrumbs,
  Heading,
  IBreadcrumbsLink,
  IconType,
  ProposalStatus,
  Tag,
  TagVariant,
} from "@aragon/ods";
import { Publisher } from "@/components/publisher";
import { OptimisticProposal } from "@/plugins/optimistic-proposals/utils/types";
import { useProposalStatus } from "@/plugins/optimistic-proposals/hooks/useProposalVariantStatus";
import { Else, ElseIf, If, Then } from "@/components/if";
import { getSimpleRelativeTimeFromDate } from "@/utils/dates";
import dayjs from "dayjs";
import { HeaderSection } from "@/components/layout/header-section";
import { useGovernanceSettings } from "../../hooks/useGovernanceSettings";

const DEFAULT_PROPOSAL_TITLE = "(No proposal title)";
const DEFAULT_PROPOSAL_SUMMARY = "(No proposal summary)";

interface ProposalHeaderProps {
  proposalIdx: number;
  proposal: OptimisticProposal;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({ proposalIdx, proposal }) => {
  const status = useProposalStatus(proposal);
  const tagVariant = getTagVariantFromStatus(status);
  const { governanceSettings } = useGovernanceSettings();

  const breadcrumbs: IBreadcrumbsLink[] = [{ label: "Proposals", href: "#/" }, { label: proposalIdx.toString() }];
  const isEmergency = proposal.parameters.vetoStartDate === 0n;
  const endDateIsInThePast = Number(proposal.parameters.vetoEndDate) * 1000 < Date.now();

  let isL2GracePeriod = false;
  if (!proposal.parameters.skipL2 && governanceSettings.l2AggregationGracePeriod) {
    const gracePeriodEnd =
      (Number(proposal.parameters.vetoEndDate) + Number(governanceSettings.l2AggregationGracePeriod)) * 1000;

    isL2GracePeriod = endDateIsInThePast && Date.now() < gracePeriodEnd;
  }

  return (
    <div className="flex w-full justify-center bg-neutral-0">
      {/* Wrapper */}
      <HeaderSection>
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
              <If condition={status == ProposalStatus.VETOED}>
                <Then>
                  <span className="text-neutral-500">The proposal has been defeated</span>
                </Then>
                <ElseIf condition={isL2GracePeriod}>
                  <span className="text-neutral-500">The veto period is over, waiting for L2 vetoes</span>
                </ElseIf>
                <ElseIf condition={endDateIsInThePast}>
                  <span className="text-neutral-500">The veto period is over</span>
                </ElseIf>
                <Else>
                  <span className="text-neutral-500">Active for </span>
                  <span className="text-neutral-800">
                    {getSimpleRelativeTimeFromDate(dayjs(Number(proposal.parameters.vetoEndDate) * 1000))}
                  </span>
                </Else>
              </If>
            </div>
          </div>
        </div>
      </HeaderSection>
    </div>
  );
};

export default ProposalHeader;

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
