import { useState } from "react";
import { DataList, IconType, IllustrationHuman, MemberDataListItem, type DataListState } from "@aragon/ods";
import { MemberListItem } from "./MemberListItem";
import { equalAddresses } from "@/utils/evm";
import { useRouter } from "next/router";
import { useDelegates } from "../hooks/useDelegates";
import { useGovernanceToken } from "../hooks/useGovernanceToken";
import { Else, If, Then } from "@/components/if";
import { useAccount } from "wagmi";
import VerifiedDelegates from "../../../verified-delegates.json";
// import { generateSortOptions, sortItems } from "./utils";

const DEFAULT_PAGE_SIZE = 12;

interface IDelegateMemberListProps {
  verifiedOnly?: boolean;
  onAnnounceDelegation: () => void;
}

export const DelegateMemberList: React.FC<IDelegateMemberListProps> = ({ verifiedOnly, onAnnounceDelegation }) => {
  const { push } = useRouter();
  const { address } = useAccount();
  const [searchValue, setSearchValue] = useState<string>();
  //   const [activeSort, setActiveSort] = useState<string>();
  const { delegates: fetchedDelegates, status: loadingStatus } = useDelegates();
  const { delegatesTo, isLoading } = useGovernanceToken(address);
  const delegates = (fetchedDelegates || []).filter((item) => {
    if (!verifiedOnly) return true;
    return VerifiedDelegates.findIndex((d) => equalAddresses(d.address, item)) >= 0;
  });

  const totalMembers = delegates?.length || 0;
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;
  const resetFilters = () => {
    setSearchValue("");
    // setActiveSort("");
  };
  const emptyFilteredState = {
    heading: "No delegates found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      onclick: () => resetFilters(),
    },
  };

  if (!totalMembers) {
    return <NoDelegatesView verified={verifiedOnly} />;
  }

  return (
    <DataList.Root
      entityLabel={totalMembers === 1 ? "delegate" : "delegates"}
      itemsCount={totalMembers}
      // pageSize={DEFAULT_PAGE_SIZE}
      // state={dataListState}
      // onLoadMore={fetchNextPage}
    >
      <DataList.Filter
        onSearchValueChange={setSearchValue}
        searchValue={searchValue}
        placeholder="Search by name or address"
        // onSortChange={setActiveSort}
        // activeSort={activeSort}
        // sortItems={sortItems}
      />
      <DataList.Container
        // SkeletonElement={MemberDataListItem.Skeleton}
        // errorState={errorState}
        // emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {(delegates || []).map((delegate) => (
          <MemberListItem
            isMyDelegate={equalAddresses(delegatesTo, delegate)}
            key={delegate}
            onClick={() => push("#/delegates/" + delegate)}
            address={delegate}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};

function NoDelegatesView({ verified }: { verified?: boolean }) {
  return (
    <div className="w-full">
      <p className="text-md text-neutral-400">
        <If condition={verified}>
          <Then>
            There are no verified candidates with a public an announcement yet. Here you will see the addresses of
            members who have posted their candidacy. Be the first to post an announcement.
          </Then>
          <Else>
            No candidates posted an announcement yet. Here you will see the addresses of members who have posted their
            candidacy. Be the first to post an announcement.
          </Else>
        </If>
      </p>
      <IllustrationHuman className="mx-auto mb-10 max-w-72" body="VOTING" expression="CASUAL" hairs="CURLY" />
    </div>
  );
}
