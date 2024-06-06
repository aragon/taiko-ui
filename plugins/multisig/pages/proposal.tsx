import { useProposal } from "@/plugins/multisig/hooks/useProposal";
import ProposalHeader from "@/plugins/multisig/components/proposal/header";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useProposalApprove } from "@/plugins/multisig/hooks/useProposalApprove";
import { useProposalExecute } from "@/plugins/multisig/hooks/useProposalExecute";
import { generateBreadcrumbs } from "@/utils/nav";
import { useRouter } from "next/router";
import { BodySection } from "@/components/proposal/proposalBodySection";
import { ProposalVoting } from "@/components/proposalVoting";
import { ITransformedStage, IVote, ProposalStages } from "@/utils/types";
import { useProposalStatus } from "../hooks/useProposalVariantStatus";
import dayjs from "dayjs";
import { ProposalAction } from "@/components/proposalAction/proposalAction";
import { CardResources } from "@/components/proposal/cardResources";

export default function ProposalDetail({ id: proposalId }: { id: string }) {
  const router = useRouter();

  const {
    proposal,
    proposalFetchStatus,
    canApprove,
    approvals,
    isConfirming: isConfirmingApproval,
    approveProposal,
  } = useProposalApprove(proposalId);

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);
  const proposalVariant = useProposalStatus(proposal!);

  const proposalStage: ITransformedStage[] = [
    {
      id: "1",
      type: ProposalStages.MULTISIG_APPROVAL,
      variant: "approvalThreshold",
      title: "Onchain Multisig",
      status: proposalVariant!,
      disabled: false,
      proposalId: proposalId,
      providerId: "1",
      result: {
        cta: {
          disabled: !canApprove,
          isLoading: false,
          label: "Approve",
          onClick: approveProposal,
        },
        approvalAmount: proposal?.approvals || 0,
        approvalThreshold: proposal?.parameters.minApprovals || 0,
      },
      details: {
        censusBlock: Number(proposal?.parameters.snapshotBlock),
        startDate: dayjs(Number(proposal?.parameters.startDate) * 1000).toString(),
        endDate: dayjs(Number(proposal?.parameters.endDate) * 1000).toString(),
        strategy: "approvalThreshold",
        options: "approve",
      },
      votes: approvals.map(({ approver }) => ({ address: approver, variant: "approve" }) as IVote),
    },
  ];

  const { executeProposal, canExecute, isConfirming: isConfirmingExecution } = useProposalExecute(proposalId);
  const breadcrumbs = generateBreadcrumbs(router.asPath);

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
        proposalNumber={Number(proposalId) + 1}
        proposal={proposal}
        breadcrumbs={breadcrumbs}
        transactionConfirming={isConfirmingApproval || isConfirmingExecution}
        canApprove={canApprove}
        canExecute={canExecute}
        onVetoPressed={() => approveProposal()}
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
