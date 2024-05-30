import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { type ReactNode, useEffect, useState } from "react";
import ProposalCard from "@/plugins/multisig/components/proposal";
import { MultisigPluginAbi } from "@/plugins/multisig/artifacts/MultisigPlugin";
import { Button, DataList, IconType, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { useCanCreateProposal } from "@/plugins/dualGovernance/hooks/useCanCreateProposal";
import Link from "next/link";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PUB_MULTISIG_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";

const DEFAULT_PAGE_SIZE = 6;

export default function Proposals() {
  const { isConnected, address } = useAccount();
  const canCreate = useCanCreateProposal();

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const {
    data: proposalCountResponse,
    error: isError,
    isLoading,
    isFetching: isFetchingNextPage,
    refetch,
  } = useReadContract({
    address: PUB_MULTISIG_PLUGIN_ADDRESS,
    abi: MultisigPluginAbi,
    functionName: "proposalCount",
    chainId: PUB_CHAIN.id,
  });
  const proposalCount = Number(proposalCountResponse);

  useEffect(() => {
    refetch();
  }, [blockNumber]);

  const entityLabel = proposalCount === 1 ? "Proposal" : "Proposals";

  let dataListState: DataListState = "idle";
  if (isLoading) {
    dataListState = "initialLoading";
  } else if (isError) {
    dataListState = "error";
  } else if (isFetchingNextPage) {
    dataListState = "fetchingNextPage";
  }

  const emptyFilteredState = {
    heading: "No proposals found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
    },
  };

  const emptyState = {
    heading: "No proposals found",
    description: "Start by creating a proposal",
    primaryButton: {
      label: "Create onChain PIP",
      iconLeft: IconType.PLUS,
      onClick: () => alert("create proposal"),
    },
  };

  const errorState = {
    heading: "Error loading proposals",
    description: "There was an error loading the proposals. Try again!",
    secondaryButton: {
      label: "Reload proposals",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  return (
    <MainSection>
      <SectionView>
        <h1 className="justify-self-start align-middle text-3xl font-semibold">Proposals</h1>
        <div className="justify-self-end">
          <If condition={canCreate && proposalCount}>
            <Link href="#/new">
              <Button iconLeft={IconType.PLUS} size="md" variant="primary">
                Submit Proposal
              </Button>
            </Link>
          </If>
        </div>
      </SectionView>
      <If condition={proposalCount}>
        <DataList.Root
          entityLabel={entityLabel}
          itemsCount={proposalCount}
          pageSize={DEFAULT_PAGE_SIZE}
          state={dataListState}
          //onLoadMore={fetchNextPage}
        >
          <DataList.Container
            SkeletonElement={ProposalDataListItemSkeleton}
            errorState={errorState}
            emptyState={emptyState}
            emptyFilteredState={emptyFilteredState}
          >
            {proposalCount &&
              Array.from(Array(proposalCount)?.keys())
                .reverse()
                ?.map((proposalIndex, index) => (
                  // TODO: update with router agnostic ODS DataListItem
                  <ProposalCard key={proposalIndex} proposalId={BigInt(proposalIndex)} />
                ))}
          </DataList.Container>
          <DataList.Pagination />
        </DataList.Root>
      </If>
    </MainSection>
  );
}

function MainSection({ children }: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-col items-center px-4 py-6 md:w-4/5 md:p-6 lg:w-2/3 xl:py-10 2xl:w-3/5">
      {children}
    </main>
  );
}

function SectionView({ children }: { children: ReactNode }) {
  return <div className="mb-6 flex w-full flex-row content-center justify-between">{children}</div>;
}
