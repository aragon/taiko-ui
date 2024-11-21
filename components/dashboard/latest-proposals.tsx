import { DataList, Heading, ProposalDataListItemSkeleton } from "@aragon/ods";
import { Else, If, Then } from "../if";
import { MissingContentView } from "../MissingContentView";
import { useBlockNumber, useReadContract } from "wagmi";
import { PUB_CHAIN, PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS } from "@/constants";
import { TaikoOptimisticTokenVotingPluginAbi } from "@/plugins/optimistic-proposals/artifacts/TaikoOptimisticTokenVotingPlugin.sol";
import { useEffect } from "react";
import ProposalCard from "@/plugins/optimistic-proposals/components/proposal";

export const LatestProposals = () => {
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

  return (
    <section className="flex flex-1 flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <Heading size="h2">Latest proposals</Heading>
      </div>
      <If condition={proposalCount}>
        <Then>
          <DataList.Container SkeletonElement={ProposalDataListItemSkeleton}>
            {Array.from(Array(proposalCount || 0)?.keys())
              .reverse()
              ?.map((proposalIndex) => <ProposalCard key={proposalIndex} proposalIndex={proposalIndex} />)}
          </DataList.Container>
          <DataList.Pagination />
        </Then>
        <Else>
          <MissingContentView>
            No proposals have been created yet.
            <br />
            Here you will see the list of proposals initiated by the Security Council.
          </MissingContentView>
        </Else>
      </If>
    </section>
  );
};
