import { useBlockNumber, useReadContract } from "wagmi";
import { useEffect } from "react";
import ProposalCard from "@/plugins/dualGovernance/components/proposal";
import { DataList, IllustrationHuman, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { Else, If, Then } from "@/components/if";
import { PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";
import { TaikoOptimisticTokenVotingPluginAbi } from "../artifacts/TaikoOptimisticTokenVotingPlugin.sol";
import { MainSection } from "@/components/layout/main-section";

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
    <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
      <h1 className="justify-self-start align-middle text-3xl font-semibold">Proposals</h1>
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
          <div className="w-full">
            <p className="text-md text-neutral-400">
              No proposals have been created yet. Here you will see the proposals approved by the Security Council.
            </p>
            <IllustrationHuman className="mx-auto mb-10 max-w-72" body="BLOCKS" expression="SMILE_WINK" hairs="CURLY" />
          </div>
        </Else>
      </If>
    </MainSection>
  );
}
