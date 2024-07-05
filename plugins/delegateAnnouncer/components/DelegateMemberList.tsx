import { useEffect, useState } from "react";
// import { MemberProfile } from "@/components/nav/routes";
// import { useDebouncedValue } from "@/hooks/useDebouncedValue";
// import { useDelegate } from "@/plugins/erc20Votes/hooks/useDelegate";
// import { isAddressEqual } from "@/utils/evm";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useAccount } from "wagmi";
// import { delegatesList } from "../../../services/members/query-options";
import { MemberListItem } from "./MemberListItem";
import { equalAddresses } from "@/utils/evm";
import { useRouter } from "next/router";
// import { generateSortOptions, sortItems } from "./utils";

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MILLS = 500;

interface IDelegateMemberListProps {
  onAnnounceDelegation: () => void;
}

const TEMP_LIST = [
  { votingPower: 1.55, isDelegate: false, address: "0x1234123412341234123412341234412341234333" },
  { votingPower: 2.45, isDelegate: true, address: "0x1234123412341234123412341234412341234333" },
  { votingPower: 7.55, isDelegate: false, address: "0x1234123412341234123412341234412341234333" },
  { votingPower: 3.55, isDelegate: false, address: "0x2341234123412341234123412344123412343331" },
  { votingPower: 1.55, isDelegate: false, address: "0x3412341234123412341234123441234123433311" },
];
const TEMP_YOUR_DELEGATE = "0x3412341234123412341234123441234123433311";

export const DelegateMemberList: React.FC<IDelegateMemberListProps> = ({ onAnnounceDelegation }) => {
  const { push } = useRouter();
  //   const [activeSort, setActiveSort] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>();
  //   const [debouncedQuery, setDebouncedQuery] = useDebouncedValue<string | undefined>(
  //     searchValue?.trim()?.toLowerCase(),
  //     {
  //       delay: SEARCH_DEBOUNCE_MILLS,
  //     }
  //   );
  //   const { address } = useAccount();
  //   const { data: yourDelegate } = useDelegate(address);
  //   const {
  //     data: delegatesQueryData,
  //     isError,
  //     isLoading,
  //     isFetching,
  //     isRefetching,
  //     isRefetchError,
  //     isFetchingNextPage,
  //     isFetchNextPageError,
  //     refetch,
  //     fetchNextPage,
  //   } = useInfiniteQuery({
  //     ...delegatesList({
  //       limit: DEFAULT_PAGE_SIZE,
  //       ...(activeSort ? generateSortOptions(activeSort) : {}),
  //       ...(debouncedQuery ? { search: debouncedQuery } : {}),
  //     }),
  //   });
  // const isFiltered = !!searchValue?.trim();
  // const loading = isLoading || (isError && isRefetching);
  // const error = isError && !isRefetchError && !isFetchNextPageError;
  // const [dataListState, setDataListState] = useState<DataListState>(() =>
  //   generateDataListState(loading, error, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
  // );
  // useEffect(() => {
  //   setDataListState(
  //     generateDataListState(loading, isError, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
  //   );
  // }, [isError, isFetching, isFetchingNextPage, loading, isRefetching, isFiltered]);
  //   useEffect(() => {
  //     if (!!debouncedQuery || !!activeSort) {
  //       setDataListState("loading");
  //     }
  //   }, [debouncedQuery, activeSort]);
  //   const resetFilters = () => {
  //     setSearchValue("");
  //     setDebouncedQuery("");
  //     setActiveSort("");
  //   };
  // const totalMembers = delegatesQueryData?.pagination?.total;
  const totalMembers = 27; // REMOVE
  // const entityLabel = totalMembers === 1 ? "Delegate" : "Delegates";
  const entityLabel = "Delegates";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;
  //   const emptyFilteredState = {
  //     heading: "No delegates found",
  //     description: "Your applied filters are not matching with any results. Reset and search with other filters!",
  //     secondaryButton: {
  //       label: "Reset all filters",
  //       iconLeft: IconType.RELOAD,
  //       onclick: () => resetFilters(),
  //     },
  //   };
  //   const emptyState = {
  //     heading: "No delegates found",
  //     description: "Create your delegate profile",
  //     primaryButton: {
  //       label: "Announce delegation",
  //       onClick: onAnnounceDelegation,
  //     },
  //   };
  //   const errorState = {
  //     heading: "Error loading delegates",
  //     description: "There was an error loading the delegates. Please try again!",
  //     secondaryButton: {
  //       label: "Reload delegates",
  //       iconLeft: IconType.RELOAD,
  //       onClick: () => refetch(),
  //     },
  //   };
  return (
    <DataList.Root
      entityLabel={entityLabel}
      // itemsCount={totalMembers}
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
        // emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {TEMP_LIST.map((delegate) => (
          <MemberListItem
            votingPower={delegate.votingPower}
            isDelegate={equalAddresses(TEMP_YOUR_DELEGATE, delegate.address)}
            key={delegate.address}
            onClick={() => push("#/delegates/" + delegate.address)}
            address={delegate.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
