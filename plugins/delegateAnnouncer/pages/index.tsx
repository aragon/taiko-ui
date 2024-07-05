import { MainSection } from "@/components/layout/main-section";
// import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { Button, Heading, Toggle, ToggleGroup } from "@aragon/ods";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/DelegateAnnouncementDialog";
// import { CouncilMemberList } from "../components/memberDataList/councilMemberList/councilMemberList";
import { DelegateMemberList } from "../components/DelegateMemberList";
// import { councilMemberList, delegatesList } from "../services/members/query-options";
import { useMetadata } from "@/hooks/useMetadata";
import { type IAnnouncementMetadata } from "@/plugins/delegateAnnouncer/utils/types";

const DEFAULT_PAGE_SIZE = 12;
const DELEGATION_DESCRIPTION =
  "Proposals submitted to the community can be vetoed by token holders. Additionally, token holders can opt to delegate their voting power to delegates.";

const TEMP_DELEGATE_COUNT = 15;

export default function MembersList() {
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { address, isConnected } = useAccount();

  // const { data: announcementData } = useAnnouncement(address);
  const { data: announcement } = useMetadata<IAnnouncementMetadata>(""); // announcementData?.[0]);

  // const { data: councilMemberListData } = useQuery({
  //   ...councilMemberList(),
  // });

  // const { data: delegatesListData } = useInfiniteQuery({
  //   ...delegatesList({
  //     limit: DEFAULT_PAGE_SIZE,
  //   }),
  // });

  const getButtonLabel = () => {
    if (!isConnected) {
      return "Connect to create delegation profile";
    } else if (announcement) {
      return "Update delegation profile";
    } else {
      return "Create delegation profile";
    }
  };

  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280] flex-col gap-x-20 gap-y-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <Heading size="h1">Members</Heading>
          </div>
          <DelegateMemberList onAnnounceDelegation={() => setShowProfileCreationDialog(true)} />
        </div>
        <aside className="flex w-full flex-col gap-y-4 md:max-w-[320px] md:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <p className="text-neutral-500">{DELEGATION_DESCRIPTION}</p>
          </div>
          <dl className="divide-y divide-neutral-100">
            {/* <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Security council
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">{`${councilMemberListData?.length} Multisig members`}</dd>
            </div> */}
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Delegates
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">{TEMP_DELEGATE_COUNT} delegates</dd>
            </div>
          </dl>
          <Button onClick={() => setShowProfileCreationDialog(true)} disabled={!isConnected}>
            {getButtonLabel()}
          </Button>
          <DelegateAnnouncementDialog
            onClose={() => setShowProfileCreationDialog(false)}
            open={showProfileCreationDialog}
          />
        </aside>
      </div>
    </MainSection>
  );
}
