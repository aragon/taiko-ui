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
import { AddressText } from "@/components/text/address";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { Else, ElseIf, If, Then } from "@/components/if";
import { useWeb3Modal } from "@web3modal/wagmi/react";

const DEFAULT_PAGE_SIZE = 12;
const DELEGATION_DESCRIPTION =
  "Proposals submitted to the community can be vetoed by token holders. Additionally, token holders can opt to delegate their voting power to delegates.";

const TEMP_DELEGATE_COUNT = 15;

export default function MembersList() {
  const { open } = useWeb3Modal();
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { isConnected } = useAccount();

  const [toggleValue, setToggleValue] = useState<string>("all");
  const onToggleChange = (value: string | undefined) => {
    if (value) setToggleValue(value);
  };

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

  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280] flex-col gap-x-20 gap-y-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <Heading size="h1">Members</Heading>

            <ToggleGroup isMultiSelect={false} onChange={onToggleChange} value={toggleValue}>
              <Toggle value="all" label="All delegates" />
              <Toggle value="verified" label="Verified delegates" />
            </ToggleGroup>
          </div>
          <DelegateMemberList onAnnounceDelegation={() => setShowProfileCreationDialog(true)} />
        </div>
        <aside className="flex w-full flex-col gap-y-4 md:max-w-[320px] md:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <p className="text-neutral-500">{DELEGATION_DESCRIPTION}</p>
          </div>
          <dl className="divide-y divide-neutral-100">
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Delegates
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">{TEMP_DELEGATE_COUNT} delegates</dd>
            </div>
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Token contract
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">
                <AddressText>{PUB_TOKEN_ADDRESS}</AddressText>
              </dd>
            </div>
          </dl>
          <If condition={!isConnected}>
            <Then>
              <Button onClick={() => open()}>Connect to create your profile</Button>
            </Then>
            <ElseIf condition={announcement}>
              <Button onClick={() => setShowProfileCreationDialog(true)}>Update delegation profile</Button>
            </ElseIf>
            <Else>
              <Button onClick={() => setShowProfileCreationDialog(true)}>Create delegation profile</Button>
            </Else>
          </If>
          <DelegateAnnouncementDialog
            onClose={() => setShowProfileCreationDialog(false)}
            open={showProfileCreationDialog}
          />
        </aside>
      </div>
    </MainSection>
  );
}
