import type { useProposal } from "@/plugins/dualGovernance/hooks/useProposal";
import ProposalHeader from "@/plugins/dualGovernance/components/proposal/header";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useProposalVeto } from "@/plugins/dualGovernance/hooks/useProposalVeto";
import { useProposalExecute } from "@/plugins/dualGovernance/hooks/useProposalExecute";
import { BodySection } from "@/components/proposal/proposalBodySection";
import { ProposalVoting } from "@/components/proposalVoting";
import type { ITransformedStage, IVote } from "@/utils/types";
import { ProposalStages } from "@/utils/types";
import { useProposalStatus } from "../hooks/useProposalVariantStatus";
import dayjs from "dayjs";
import { ProposalAction } from "@/components/proposalAction/proposalAction";
import { CardResources } from "@/components/proposal/cardResources";
import { formatEther } from "viem";
import { useVotingToken } from "../hooks/useVotingToken";
import { usePastSupply } from "../hooks/usePastSupply";

export default function ProposalDetail({ index: proposalIdx }: { index: number }) {
  const {
    proposal,
    proposalFetchStatus,
    canVeto,
    vetoes,
    isConfirming: isConfirmingVeto,
    vetoProposal,
  } = useProposalVeto(proposalIdx);
  const pastSupply = usePastSupply(proposal);
  const { symbol: tokenSymbol } = useVotingToken();

  const { executeProposal, canExecute, isConfirming: isConfirmingExecution } = useProposalExecute(proposalIdx);

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);
  const proposalVariant = useProposalStatus(proposal!);
  const vetoPercentage =
    proposal?.vetoTally && pastSupply && proposal.parameters.minVetoRatio
      ? Number(
          (BigInt(100) * proposal.vetoTally) /
            ((pastSupply * BigInt(proposal.parameters.minVetoRatio)) / BigInt(1000000))
        )
      : 0;

  // TODO: This is not revelant anymore
  const proposalStage: ITransformedStage[] = [
    {
      id: "1",
      type: ProposalStages.OPTIMISTIC_EXECUTION,
      variant: "majorityVoting",
      title: "Optimistic voting",
      status: proposalVariant!,
      disabled: false,
      proposalId: proposalIdx.toString(),
      providerId: "1",
      result: {
        cta: proposal?.executed
          ? {
              disabled: true,
              label: "Executed",
            }
          : canExecute
            ? {
                isLoading: isConfirmingExecution,
                label: "Execute",
                onClick: executeProposal,
              }
            : {
                disabled: !canVeto,
                isLoading: isConfirmingVeto,
                label: "Veto",
                onClick: vetoProposal,
              },
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
        startDate: dayjs(Number(proposal?.parameters.vetoStartDate) * 1000).toString(),
        endDate: dayjs(Number(proposal?.parameters.vetoEndDate) * 1000).toString(),
        strategy: "Optimistic voting",
        options: "Veto",
      },
      votes: vetoes.map(({ voter }) => ({ address: voter, variant: "no" }) as IVote),
    },
  ];

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
            <ProposalVoting
              stages={proposalStage}
              description="The optimistic voting flow allows token holders to veto proposals to which they object. If not enough voting power has vetoed for a given period of time, the proposal will become executable on the DAO."
            />
            <ProposalAction
              canExecute={canExecute}
              isConfirmingExecution={isConfirmingExecution}
              onExecute={() => executeProposal()}
              actions={proposal.actions}
            />
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
