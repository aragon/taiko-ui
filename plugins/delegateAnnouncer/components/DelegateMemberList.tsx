import { useState } from "react";
import { DataList, IconType, IllustrationHuman, MemberDataListItem, type DataListState } from "@aragon/ods";
import { MemberListItem } from "./MemberListItem";
import { equalAddresses } from "@/utils/evm";
import { useRouter } from "next/router";
import { useDelegates } from "../hooks/useDelegates";
import { useDelegate } from "../hooks/useDelegate";
import { useAccount } from "wagmi";
// import { useDelegate } from "@/plugins/erc20Votes/hooks/useDelegate";
// import { generateSortOptions, sortItems } from "./utils";

const DEFAULT_PAGE_SIZE = 12;

const TEST_LIST = [
  "0x2234123412341234123412341234412341234333",
  "0x3134123412341234123412341234412341234333",
  "0x1234123412341234123412341234412341234333",
  "0x2341234123412341234123412344123412343331",
  "0x3412341234123412341234123441234123433311",
];

interface IDelegateMemberListProps {
  onAnnounceDelegation: () => void;
}

export const DelegateMemberList: React.FC<IDelegateMemberListProps> = ({ onAnnounceDelegation }) => {
  const { push } = useRouter();
  const { address } = useAccount();
  const [searchValue, setSearchValue] = useState<string>();
  //   const [activeSort, setActiveSort] = useState<string>();
  const { delegates, status: loadingStatus } = useDelegates();
  const { delegate: myDelegate } = useDelegate(address);

  const resetFilters = () => {
    setSearchValue("");
    // setActiveSort("");
  };
  const totalMembers = delegates?.length || 0;
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;
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
    return <NoDelegatesView />;
  }

  return (
    <DataList.Root
      entityLabel="Delegates"
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
        {((delegates && delegates) || TEST_LIST).map((delegate) => (
          <MemberListItem
            isMyDelegate={equalAddresses(myDelegate, delegate)}
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

function NoDelegatesView() {
  return (
    <div className="w-full">
      <p className="text-md text-neutral-400">
        No delegates have posted an announcement yet. Here you will see the addresses of members who have posted their
        candidacy. Be the first to post an announcement.
      </p>
      <IllustrationHuman className="mx-auto mb-10 max-w-72" body="VOTING" expression="CASUAL" hairs="CURLY" />
    </div>
  );
}
