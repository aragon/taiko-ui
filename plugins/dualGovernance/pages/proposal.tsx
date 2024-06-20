import { useProposal } from "@/plugins/dualGovernance/hooks/useProposal";
import ProposalHeader from "@/plugins/dualGovernance/components/proposal/header";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useProposalVeto } from "@/plugins/dualGovernance/hooks/useProposalVeto";
import { useProposalExecute } from "@/plugins/dualGovernance/hooks/useProposalExecute";
import { generateBreadcrumbs } from "@/utils/nav";
import { useRouter } from "next/router";
import { BodySection } from "@/components/proposal/proposalBodySection";
import { ProposalVoting } from "@/components/proposalVoting";
import { ITransformedStage, IVote, ProposalStages } from "@/utils/types";
import { useProposalStatus } from "../hooks/useProposalVariantStatus";
import dayjs from "dayjs";
import { ProposalAction } from "@/components/proposalAction/proposalAction";
import { CardResources } from "@/components/proposal/cardResources";

export default function ProposalDetail({ index: proposalId }: { index: number }) {
  const router = useRouter();

  const {
    proposal,
    proposalFetchStatus,
    canVeto,
    vetoes,
    isConfirming: isConfirmingApproval,
    vetoProposal,
  } = useProposalVeto(proposalId);

  const { executeProposal, canExecute, isConfirming: isConfirmingExecution } = useProposalExecute(BigInt(proposalId));
  const breadcrumbs = generateBreadcrumbs(router.asPath);

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);
  const proposalVariant = useProposalStatus(proposal!);

  // TODO: This is not revelant anymore
  const proposalStage: ITransformedStage[] = [
    {
      id: "1",
      type: ProposalStages.OPTIMISTIC_EXECUTION,
      variant: "majorityVoting",
      title: "Onchain Multisig",
      status: proposalVariant!,
      disabled: false,
      proposalId: proposalId.toString(),
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
                isLoading: isConfirmingApproval,
                label: "Veto",
                onClick: vetoProposal,
              },
        votingScores: [
          {
            option: "Vetoes",
            voteAmount: proposal?.vetoTally.toString() || "0",
            votePercentage: 0,
            tokenSymbol: "TKO",
          },
        ],
        proposalId: proposalId.toString(),
      },
      details: {
        censusBlock: Number(proposal?.parameters.snapshotTimestamp),
        startDate: dayjs(Number(proposal?.parameters.vetoStartDate) * 1000).toString(),
        endDate: dayjs(Number(proposal?.parameters.vetoEndDate) * 1000).toString(),
        strategy: "approvalThreshold",
        options: "approve",
      },
      votes: vetoes.map(({ approver }) => ({ address: approver, variant: "veto" }) as IVote),
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
      <ProposalHeader
        proposalNumber={proposalId + 1}
        proposal={proposal}
        breadcrumbs={breadcrumbs}
        transactionConfirming={isConfirmingApproval || isConfirmingExecution}
        canApprove={canVeto}
        canExecute={canExecute}
        onVetoPressed={() => vetoProposal()}
        onExecutePressed={() => executeProposal()}
      />

      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-16 md:pb-20 md:pt-10">
        <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
          <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
            <BodySection body={proposal.description || "No description was provided"} />
            <ProposalVoting stages={proposalStage} />
            <ProposalAction actions={proposal.actions} />
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
