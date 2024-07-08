import { MainSection } from "@/components/layout/main-section";
import { Button, Heading, Toggle, ToggleGroup } from "@aragon/ods";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/DelegateAnnouncementDialog";
import { DelegateMemberList } from "../components/DelegateMemberList";
import { AddressText } from "@/components/text/address";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { Else, ElseIf, If, Then } from "@/components/if";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDelegates } from "../hooks/useDelegates";
import { useDelegateAnnounce } from "../hooks/useDelegateAnnounce";

const DELEGATION_DESCRIPTION =
  "Proposals submitted to the community can be vetoed by token holders. Additionally, token holders can opt to delegate their voting power to delegates.";

export default function MembersList() {
  const { open } = useWeb3Modal();
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);
  const { address, isConnected } = useAccount();
  const { delegates } = useDelegates();
  const delegateCount = delegates?.length || 0;

  const [toggleValue, setToggleValue] = useState<"all" | "verified">("all");
  const onToggleChange = (value: string | undefined) => {
    if (value) setToggleValue(value as "all" | "verified");
  };

  const { announce } = useDelegateAnnounce(address);

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
          <DelegateMemberList
            verifiedOnly={toggleValue === "verified"}
            onAnnounceDelegation={() => setShowProfileCreationDialog(true)}
          />
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
              <dd className="size-full text-base leading-tight text-neutral-500">
                {delegateCount === 1 ? "1 delegate" : `${delegateCount} delegates`} registered
              </dd>
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
            <ElseIf condition={announce}>
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
