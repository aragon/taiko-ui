import { type ReactNode, useEffect } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import ProposalCard from "@/plugins/emergency-multisig/components/proposal";
import { EmergencyMultisigPluginAbi } from "@/plugins/emergency-multisig/artifacts/EmergencyMultisigPlugin";
import {
  Button,
  CardEmptyState,
  DataList,
  IconType,
  ProposalDataListItemSkeleton,
  type DataListState,
} from "@aragon/ods";
import { useCanCreateProposal } from "@/plugins/emergency-multisig/hooks/useCanCreateProposal";
import Link from "next/link";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS, PUB_CHAIN } from "@/constants";
import { useDerivedWallet } from "../../../hooks/useDerivedWallet";
import { MissingContentView } from "@/components/MissingContentView";
import { MainSection } from "@/components/layout/main-section";
import {
  AccountEncryptionStatus,
  useAccountEncryptionStatus,
} from "@/plugins/encryption/hooks/useAccountEncryptionStatus";
import { EncryptionPlaceholderOrChildren } from "../components/encryption-check-or-children";
import { useRouter } from "next/router";

const DEFAULT_PAGE_SIZE = 6;

export default function Proposals() {
  const { address: selfAddress, isConnected } = useAccount();
  const { status } = useAccountEncryptionStatus(selfAddress);
  const { push } = useRouter();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { canCreate } = useCanCreateProposal();
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

  return (
    <MainSection narrow>
      <SectionView>
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Proposals
        </h1>
        <div className="justify-self-end">
          <If condition={isConnected && canCreate && status === AccountEncryptionStatus.READY_ALL}>
            <Link href="#/new">
              <Button iconLeft={IconType.PLUS} size="md" variant="primary">
                Submit Proposal
              </Button>
            </Link>
          </If>
        </div>
      </SectionView>

      <EncryptionPlaceholderOrChildren isEncrypted>
        <If condition={!proposalCount}>
          <Then>
            <If condition={canCreate}>
              <Then>
                <CardEmptyState
                  heading="No proposals yet"
                  description="The list of proposals is currently empty. Be the first one to create a proposal."
                  objectIllustration={{
                    object: "ACTION",
                  }}
                  primaryButton={{
                    label: "Submit a proposal",
                    onClick: () => push("#/new"),
                  }}
                />
              </Then>
              <Else>
                <CardEmptyState
                  heading="No proposals yet"
                  description="The list of proposals is currently empty. Here you will see the proposals created by the Security Council before a super majority can enact an emergency execution on the DAO."
                  objectIllustration={{
                    object: "ACTION",
                  }}
                />
              </Else>
            </If>
          </Then>
          <Else>
            <DataList.Root
              entityLabel={entityLabel}
              itemsCount={proposalCount}
              pageSize={DEFAULT_PAGE_SIZE}
              state={dataListState}
              //onLoadMore={fetchNextPage}
            >
              <DataList.Container SkeletonElement={ProposalDataListItemSkeleton}>
                {proposalCount &&
                  Array.from(Array(proposalCount || 0)?.keys())
                    .reverse()
                    ?.map((proposalIndex) => (
                      // TODO: update with router agnostic ODS DataListItem
                      <ProposalCard key={proposalIndex} proposalId={BigInt(proposalIndex)} />
                    ))}
              </DataList.Container>
              <DataList.Pagination />
            </DataList.Root>
          </Else>
        </If>
      </EncryptionPlaceholderOrChildren>
    </MainSection>
  );
}

function SectionView({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-row content-center justify-between">{children}</div>;
}
