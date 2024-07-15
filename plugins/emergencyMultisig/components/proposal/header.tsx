import { AvatarIcon, Breadcrumbs, Button, Heading, IBreadcrumbsLink, IconType, Tag, TagVariant } from "@aragon/ods";
import { useProposalStatus } from "@/plugins/emergencyMultisig/hooks/useProposalVariantStatus";
import dayjs from "dayjs";
import classNames from "classnames";
import { ReactNode } from "react";
import { Publisher } from "@/components/publisher";
import { getSimpleRelativeTimeFromDate } from "@/utils/dates";
import { EmergencyProposal } from "../../utils/types";
import { Else, If, Then } from "@/components/if";

interface ProposalHeaderProps {
  proposalId: string;
  proposal: EmergencyProposal;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({ proposalId, proposal }) => {
  const status = useProposalStatus(proposal);
  const tagVariant = getTagVariantFromStatus(status);
  const breadcrumbs: IBreadcrumbsLink[] = [{ label: "Proposals", href: "#/" }, { label: proposalId }];
  const expired = Number(proposal.parameters.expirationDate) * 1000 <= Date.now();

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
              <If condition={expired}>
                <Then>
                  <span className="text-neutral-500">The proposal expired</span>
                </Then>
                <Else>
                  <span className="text-neutral-800">
                    {getSimpleRelativeTimeFromDate(dayjs(Number(proposal.parameters.expirationDate) * 1000))}
                  </span>
                  <span className="text-neutral-500">left until expiration</span>
                </Else>
              </If>
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
