import { type ReactNode, useEffect, useState } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import ProposalCard from "@/plugins/emergencyMultisig/components/proposal";
import { EmergencyMultisigPluginAbi } from "@/plugins/emergencyMultisig/artifacts/EmergencyMultisigPlugin";
import {
  Button,
  DataList,
  IconType,
  IllustrationHuman,
  ProposalDataListItemSkeleton,
  type DataListState,
} from "@aragon/ods";
import { useCanCreateProposal } from "@/plugins/emergencyMultisig/hooks/useCanCreateProposal";
import Link from "next/link";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";
import { useDerivedWallet } from "../hooks/useDerivedWallet";
import { MissingContentView } from "@/components/MissingContentView";
import { MainSection } from "@/components/layout/main-section";

const DEFAULT_PAGE_SIZE = 6;

export default function Proposals() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { publicKey, requestSignature } = useDerivedWallet();
  const canCreate = useCanCreateProposal();
  const {
    data: proposalCountResponse,
    error: isError,
    isLoading,
    isFetching: isFetchingNextPage,
    refetch,
  } = useReadContract({
    address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
    abi: EmergencyMultisigPluginAbi,
    functionName: "proposalCount",
    chainId: PUB_CHAIN.id,
  });
  const proposalCount = proposalCountResponse ? Number(proposalCountResponse) : 0;

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

  const emptyFilteredState = {
    heading: "No proposals found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
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
    <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
      <SectionView>
        <h1 className="justify-self-start align-middle text-3xl font-semibold">Proposals</h1>
        <div className="justify-self-end">
          <If condition={isConnected && canCreate}>
            <Link href="#/new">
              <Button iconLeft={IconType.PLUS} size="md" variant="primary">
                Submit Proposal
              </Button>
            </Link>
          </If>
        </div>
      </SectionView>

      <If condition={!isConnected}>
        <Then>
          <MissingContentView
            message={`Please, connect your Ethereum wallet in order to continue.`}
            callToAction="Connect wallet"
            onClick={() => open()}
          />
        </Then>
        <ElseIf condition={!publicKey}>
          <MissingContentView
            message={`Please, sign in with your wallet in order to decrypt the private proposal data.`}
            callToAction="Sign in to continue"
            onClick={() => requestSignature()}
          />
        </ElseIf>
        <ElseIf condition={proposalCount}>
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
              emptyFilteredState={emptyFilteredState}
            >
              {proposalCount &&
                Array.from(Array(proposalCount || 0)?.keys())
                  .reverse()
                  ?.map((proposalIndex, index) => (
                    // TODO: update with router agnostic ODS DataListItem
                    <ProposalCard key={proposalIndex} proposalId={BigInt(proposalIndex)} />
                  ))}
            </DataList.Container>
            <DataList.Pagination />
          </DataList.Root>
        </ElseIf>
        <Else>
          <div className="w-full">
            <p className="text-md text-neutral-400">
              No proposals have been created yet. Here you will see the proposals created by the Security Council before
              they can be submitted to the{" "}
              <Link href="/plugins/community-proposals/#/" className="underline">
                community voting stage
              </Link>
              .
            </p>
            <IllustrationHuman className="mx-auto mb-10 max-w-72" body="BLOCKS" expression="SMILE_WINK" hairs="CURLY" />
            <If condition={isConnected && canCreate}>
              <div className="flex justify-center">
                <Link href="#/new">
                  <Button iconLeft={IconType.PLUS} size="md" variant="primary">
                    Submit Proposal
                  </Button>
                </Link>
              </div>
            </If>
          </div>
        </Else>
      </If>
    </MainSection>
  );
}

function SectionView({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-row content-center justify-between">{children}</div>;
}
