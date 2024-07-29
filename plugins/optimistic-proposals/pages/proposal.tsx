import type { useProposal } from "@/plugins/optimistic-proposals/hooks/useProposal";
import ProposalHeader from "@/plugins/optimistic-proposals/components/proposal/header";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useProposalVeto } from "@/plugins/optimistic-proposals/hooks/useProposalVeto";
import { useProposalExecute } from "@/plugins/optimistic-proposals/hooks/useProposalExecute";
import { BodySection } from "@/components/proposal/proposalBodySection";
import { IBreakdownMajorityVotingResult, ProposalVoting } from "@/components/proposalVoting";
import type { ITransformedStage, IVote } from "@/utils/types";
import { ProposalStages } from "@/utils/types";
import { useProposalStatus } from "../hooks/useProposalVariantStatus";
import dayjs from "dayjs";
import { ProposalActions } from "@/components/proposalActions/proposalActions";
import { CardResources } from "@/components/proposal/cardResources";
import { formatEther } from "viem";
import { useToken } from "../hooks/useToken";
import { usePastSupply } from "../hooks/usePastSupply";
import { If } from "@/components/if";
import { AlertCard } from "@aragon/ods";
import { PUB_TOKEN_SYMBOL } from "@/constants";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useTokenPastVotes } from "../hooks/useTokenPastVotes";
import { useTokenVotes } from "@/hooks/useTokenVotes";

const ZERO = BigInt(0);

export default function ProposalDetail({ index: proposalIdx }: { index: number }) {
  const { address } = useAccount();
  const {
    proposal,
    proposalFetchStatus,
    canVeto,
    vetoes,
    isConfirming: isConfirmingVeto,
    vetoProposal,
  } = useProposalVeto(proposalIdx);
  const pastSupply = usePastSupply(proposal);
  const { symbol: tokenSymbol } = useToken();
  const { balance, delegatesTo } = useTokenVotes(address);
  const { votes: pastVotes } = useTokenPastVotes(address, proposal?.parameters.snapshotTimestamp);

  const { executeProposal, canExecute, isConfirming: isConfirmingExecution } = useProposalExecute(proposalIdx);

  const startDate = dayjs(Number(proposal?.parameters.vetoStartDate) * 1000).toString();
  const endDate = dayjs(Number(proposal?.parameters.vetoEndDate) * 1000).toString();

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);
  const proposalStatus = useProposalStatus(proposal!);
  const vetoPercentage =
    proposal?.vetoTally && pastSupply && proposal.parameters.minVetoRatio
      ? Number(
          (BigInt(100) * proposal.vetoTally) /
            ((pastSupply * BigInt(proposal.parameters.minVetoRatio)) / BigInt(1000000))
        )
      : 0;

  let cta: IBreakdownMajorityVotingResult["cta"];
  if (proposal?.executed) {
    cta = {
      disabled: true,
      label: "Executed",
    };
  } else if (proposalStatus === "accepted") {
    cta = {
      disabled: !canExecute,
      isLoading: isConfirmingExecution,
      label: "Execute",
      onClick: executeProposal,
    };
  } else if (proposalStatus === "active") {
    cta = {
      disabled: !canVeto,
      isLoading: isConfirmingVeto,
      label: "Veto",
      onClick: vetoProposal,
    };
  }

  const proposalStage: ITransformedStage[] = [
    {
      id: "1",
      type: ProposalStages.OPTIMISTIC_EXECUTION,
      variant: "majorityVoting",
      title: "Optimistic voting",
      status: proposalStatus!,
      disabled: false,
      proposalId: proposalIdx.toString(),
      providerId: "1",
      result: {
        cta,
        votingScores: [
          {
            option: "Veto",
            voteAmount: formatEther(proposal?.vetoTally || BigInt(0)),
            votePercentage: vetoPercentage,
            tokenSymbol: tokenSymbol || "TKO",
          },
        ],
        proposalId: proposalIdx.toString(),
      },
      details: {
        censusTimestamp: Number(proposal?.parameters.snapshotTimestamp || 0) || 0,
        startDate,
        endDate,
        strategy: "Optimistic voting",
        options: "Veto",
      },
      votes: vetoes.map(({ voter }) => ({ address: voter, variant: "no" }) as IVote),
    },
  ];

  let showReclaimVotingPower = false;
  if (pastVotes === ZERO && !!balance && balance > ZERO && delegatesTo !== address) {
    showReclaimVotingPower = true;
  }

  if (!proposal || showProposalLoading) {
    return (
      <section className="justify-left items-left flex w-screen min-w-full max-w-full">
        <PleaseWaitSpinner />
      </section>
    );
  }

  return (
    <section className="flex w-screen min-w-full max-w-full flex-col items-center">
      <ProposalHeader proposalIdx={proposalIdx} proposal={proposal} />

      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-16 md:pb-20 md:pt-10">
        <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
          <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
            <BodySection body={proposal.description || "No description was provided"} />
            <If condition={showReclaimVotingPower}>
              <AlertCard
                description={
                  <span>
                    This can happen because your voting power was delegated to another address when the proposal was
                    created or because you didn&apos;t hold any {PUB_TOKEN_SYMBOL} at the time. If you want to act by
                    yourself in future proposals, make sure that you hold tokens and that{" "}
                    <Link href={"/plugins/members/#/delegates/" + address} className="font-semibold hover:underline">
                      your voting power is self delegated
                    </Link>
                    .
                  </span>
                }
                message="Veto unavailable"
                variant="warning"
              />
            </If>
            <ProposalVoting
              stages={proposalStage}
              description="The optimistic voting flow allows token holders to veto proposals to which they object. If not enough voting power has vetoed for a given period of time, the proposal will become executable on the DAO."
            />
            <ProposalActions actions={proposal.actions} />
          </div>
          <div className="flex flex-col gap-y-6 md:w-[33%]">
            <CardResources resources={proposal.resources} title="Resources" />
          </div>
        </div>
      </div>
    </section>
  );
}

function getShowProposalLoading(
  proposal: ReturnType<typeof useProposal>["proposal"],
  status: ReturnType<typeof useProposal>["status"]
) {
  if (!proposal && status.proposalLoading) return true;
  else if (status.metadataLoading && !status.metadataError) return true;
  else if (!proposal?.title && !status.metadataError) return true;

  return false;
}
