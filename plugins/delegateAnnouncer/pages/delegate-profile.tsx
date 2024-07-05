import { type IAnnouncementMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { useMetadata } from "@/hooks/useMetadata";
// import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
// import { isAddressEqual } from "@/utils/evm";
import { Heading } from "@aragon/ods";
// import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { ProfileAside } from "../components/ProfileAside";
import { DelegationStatement } from "../components/DelegationStatement";
import { HeaderMember } from "../components/HeaderMember";
// import { DelegationsReceivedDataList } from "../components/memberDataList/delegationsReceivedDataList/delegationsReceivedDataList";
// import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";
// import { councilMemberList } from "../services/members/query-options";
// import { ProposalStages } from "@/features/proposals";

export const DelegateProfile = ({ address }: { address: Address }) => {
  // const { data: councilMember, isFetched: councilMemberFetched } = useQuery({
  //   ...councilMemberList(),
  //   select: (data) => data.find((member) => isAddressEqual(member.address, profileAddress)),
  // });

  // const { data: announcementData } = useAnnouncement(profileAddress);
  // const { data: announcement } = useMetadata<IAnnouncementMetadata>(announcementData?.[0]);

  return (
    <div className="flex flex-col items-center">
      <HeaderMember address={address} name={announcement?.name || address} bio={announcement?.bio} />
      <div className="flex w-full max-w-screen-xl flex-col gap-x-16 gap-y-12 px-4 py-6 md:flex-row md:px-16 md:pb-20 md:pt-12">
        {/* Main section */}
        <div className="flex flex-col gap-y-12 md:w-[720px] md:gap-y-20">
          {/* Delegation Statement */}
          <div className="flex w-full flex-col gap-y-6 overflow-auto">
            <DelegationStatement message={announcement?.message} />
            {/* Delegations Received */}
            <div className="flex flex-col gap-y-3">
              <Heading size="h3">Delegations received</Heading>
              {/* <DelegationsReceivedDataList address={profileAddress} /> */}
            </div>
          </div>

          {/* <div className="flex w-full flex-col gap-y-6">
            <Heading size="h2">Voting activity</Heading>
            <MemberVotesDataList
              address={profileAddress}
              stage={isCouncilMember ? ProposalStages.COUNCIL_APPROVAL : ProposalStages.COMMUNITY_VOTING}
            />
          </div> */}
        </div>
        {/* Aside */}
        <aside className="flex w-full flex-1 flex-col gap-y-12 md:max-w-[320px] md:gap-y-20">
          <ProfileAside address={address} resources={announcement?.resources} />
        </aside>
      </div>
    </div>
  );
};
