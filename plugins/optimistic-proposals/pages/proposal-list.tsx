import { useBlockNumber, useReadContract } from "wagmi";
import { useEffect } from "react";
import ProposalCard from "@/plugins/optimistic-proposals/components/proposal";
import { DataList, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { Else, If, Then } from "@/components/if";
import { PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";
import { TaikoOptimisticTokenVotingPluginAbi } from "../artifacts/TaikoOptimisticTokenVotingPlugin.sol";
import { MainSection } from "@/components/layout/main-section";
import { MissingContentView } from "@/components/MissingContentView";

const DEFAULT_PAGE_SIZE = 6;

export default function Proposals() {
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const {
    data: proposalCountResponse,
    error: isError,
    isLoading,
    isFetching: isFetchingNextPage,
    refetch,
  } = useReadContract({
    address: PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
    abi: TaikoOptimisticTokenVotingPluginAbi,
    functionName: "proposalCount",
    chainId: PUB_CHAIN.id,
  });
  const proposalCount = Number(proposalCountResponse);

  useEffect(() => {
    refetch();
  }, [blockNumber]);

  const entityLabel = proposalCount === 1 ? "Proposal" : "Proposals";

  let dataListState: DataListState = "idle";
  if (isLoading && !proposalCount) {
    dataListState = "initialLoading";
  } else if (isError) {
    dataListState = "error";
  } else if (isFetchingNextPage) {
    dataListState = "fetchingNextPage";
  }

  return (
    <MainSection narrow>
      <div className="flex w-full flex-row content-center justify-between">
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Proposals
        </h1>
      </div>
      <If condition={proposalCount}>
        <Then>
          <DataList.Root
            entityLabel={entityLabel}
            itemsCount={proposalCount}
            pageSize={DEFAULT_PAGE_SIZE}
            state={dataListState}
          >
            <DataList.Container SkeletonElement={ProposalDataListItemSkeleton}>
              {Array.from(Array(proposalCount || 0)?.keys())
                .reverse()
                ?.map((proposalIndex) => (
                  // TODO: update with router agnostic ODS DataListItem
                  <ProposalCard key={proposalIndex} proposalIndex={proposalIndex} />
                ))}
            </DataList.Container>
            <DataList.Pagination />
          </DataList.Root>
        </Then>
        <Else>
          <MissingContentView>
            No proposals have been created yet.
            <br />
            Here you will see the list of proposals approved by the Security Council which need to be ratified by the
            community.
          </MissingContentView>
        </Else>
      </If>
    </MainSection>
  );
}
