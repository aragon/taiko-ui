import { useProposal } from "@/plugins/multisig/hooks/useProposal";
import { ToggleGroup, Toggle } from "@aragon/ods";
import ProposalDescription from "@/plugins/multisig/components/proposal/description";
import VetoesSection from "@/plugins/multisig/components/approve/vetoes-section";
import ProposalHeader from "@/plugins/multisig/components/proposal/header";
import ApprovalTally from "@/plugins/multisig/components/approve/tally";
import ProposalDetails from "@/plugins/multisig/components/proposal/details";
import { Else, If, Then } from "@/components/if";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useState } from "react";
import { useProposalVeto } from "@/plugins/multisig/hooks/useProposalVeto";
import { useProposalExecute } from "@/plugins/multisig/hooks/useProposalExecute";
import { generateBreadcrumbs } from "@/utils/nav";
import { useRouter } from "next/router";
import { BodySection } from "@/components/proposal/proposalBodySection";
import { ITransformedStage, ProposalStages, ProposalVoting } from "../components/proposal/proposalVoting";

type BottomSection = "description" | "vetoes";

export default function ProposalDetail({ id: proposalId }: { id: string }) {
  const router = useRouter();
  const [bottomSection, setBottomSection] = useState<BottomSection>("description");

  const {
    proposal,
    proposalFetchStatus,
    canVeto,
    vetoes,
    isConfirming: isConfirmingVeto,
    vetoProposal,
  } = useProposalVeto(proposalId);

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);

  const proposalStage: ITransformedStage[] = [
    {
      id: "1",
      type: ProposalStages.DRAFT,
      variant: "success",
      title: "Draft",
      status: "active",
      disabled: false,
      proposalId: "1",
      providerId: "1",
      result: {
        cta: {
          disabled: false,
          isLoading: false,
          label: "Approve",
          onClick: () => {},
        },
        approvalAmount: 0,
        approvalThreshold: 0,
      },
      details: {
        censusBlock: 0,
        startDate: "2021-09-01T00:00:00Z",
        endDate: "2021-09-01T00:00:00Z",
        strategy: "approvalThreshold",
        options: "yes/no",
      },
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
        transactionConfirming={isConfirmingVeto || isConfirmingExecution}
        canVeto={canVeto}
        canExecute={canExecute}
        onVetoPressed={() => vetoProposal()}
        onExecutePressed={() => executeProposal()}
      />

      <div className="flex w-full flex-col items-center px-4 py-6 md:w-4/5 md:p-6 lg:w-2/3 xl:py-10 2xl:w-3/5">
        <BodySection body={proposal.description || "No description was provided"} />
        <div className="my-10 w-full ">
          <ProposalVoting stages={proposalStage} />
        </div>
        <div className="w-full py-12">
          <ProposalDescription {...proposal} />
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
