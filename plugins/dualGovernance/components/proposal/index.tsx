import Link from "next/link";
import { useProposalVeto } from "@/plugins/dualGovernance/hooks/useProposalVeto";
import { Card, ProposalStatus, Tag, TagVariant } from "@aragon/ods";
import { ProposalDataListItem } from "@aragon/ods";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useProposalStatus } from "../../hooks/useProposalVariantStatus";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { PUB_TOKEN_ADDRESS } from "@/constants";

const DEFAULT_PROPOSAL_METADATA_TITLE = "(No proposal title)";
const DEFAULT_PROPOSAL_METADATA_SUMMARY = "(The metadata of the proposal is not available)";

type ProposalInputs = {
  proposalId: bigint;
};

const erc20Votes = parseAbi(["function getPastTotalSupply(uint256 blockNumber) view returns (uint256)"]);

export default function ProposalCard(props: ProposalInputs) {
  const { address } = useAccount();
  const { proposal, proposalFetchStatus, vetoes } = useProposalVeto(props.proposalId.toString());
  const { data: pastSupply } = useReadContract({
    address: PUB_TOKEN_ADDRESS,
    abi: erc20Votes,
    functionName: "getPastTotalSupply",
    args: [proposal?.parameters.snapshotTimestamp || BigInt(0)],
  });

  const proposalVariant = useProposalStatus(proposal!);

  const showLoading = getShowProposalLoading(proposal, proposalFetchStatus);

  const hasVetoed = vetoes?.some((veto) => veto.voter === address);

  if (!proposal && showLoading) {
    return (
      <section className="mb-4 w-full">
        <Card className="p-4">
          <span className="xs:px-10 px-4 py-5 md:px-6 lg:px-7">
            <PleaseWaitSpinner fullMessage="Loading proposal..." />
          </span>
        </Card>
      </section>
    );
  } else if (!proposal?.title && !proposal?.summary) {
    // We have the proposal but no metadata yet
    return (
      <Link href={`#/proposals/${props.proposalId}`} className="mb-4 w-full">
        <Card className="p-4">
          <span className="xs:px-10 px-4 py-5 md:px-6 lg:px-7">
            <PleaseWaitSpinner fullMessage="Loading metadata..." />
          </span>
        </Card>
      </Link>
    );
  } else if (proposalFetchStatus.metadataReady && !proposal?.title) {
    return (
      <Link href={`#/proposals/${props.proposalId}`} className="mb-4 w-full">
        <Card className="p-4">
          <div className="xl:4/5 overflow-hidden text-ellipsis text-nowrap pr-4 md:w-7/12 lg:w-3/4">
            <h4 className="mb-1 line-clamp-1 text-lg text-neutral-300">
              {Number(props.proposalId) + 1} - {DEFAULT_PROPOSAL_METADATA_TITLE}
            </h4>
            <p className="line-clamp-3 text-base text-neutral-300">{DEFAULT_PROPOSAL_METADATA_SUMMARY}</p>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`#/proposals/${props.proposalId}`} className="mb-4 w-full cursor-pointer">
      <ProposalDataListItem.Structure
        {...proposal}
        voted={hasVetoed}
        result={{
          option: "Veto",
          voteAmount: proposal.vetoTally.toString(),
          votePercentage: pastSupply ? Number((proposal?.vetoTally * BigInt(100)) / pastSupply) : 0,
        }}
        publisher={[{ address: proposal.creator }]} // Fix: Pass an object of type IPublisher instead of a string
        status={proposalVariant!}
        type={"majorityVoting"}
      />
    </Link>
  );
}

function getShowProposalLoading(
  proposal: ReturnType<typeof useProposalVeto>["proposal"],
  status: ReturnType<typeof useProposalVeto>["proposalFetchStatus"]
) {
  if (!proposal || status.proposalLoading) return true;
  else if (status.metadataLoading && !status.metadataError) return true;
  else if (!proposal?.title && !status.metadataError) return true;

  return false;
}
