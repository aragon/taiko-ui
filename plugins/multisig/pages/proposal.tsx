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
        <div className="my-10 grid w-full gap-10 lg:grid-cols-2 xl:grid-cols-3">
          <ApprovalTally
            approvalCount={proposal?.approvals}
            approvalPercentage={Number(proposal?.approvals / proposal?.parameters?.minApprovals) * 100}
          />
        </div>
        <div className="w-full py-12">
          <div className="space-between flex flex-row">
            <h2 className="flex-grow text-3xl font-semibold text-neutral-900">
              {bottomSection === "description" ? "Description" : "Vetoes"}
            </h2>
            <ToggleGroup
              className="justify-end"
              value={bottomSection}
              isMultiSelect={false}
              onChange={(val: string | undefined) => (val ? setBottomSection(val as BottomSection) : "")}
            >
              <Toggle label="Description" value="description" />
              <Toggle label="Vetoes" value="vetoes" />
            </ToggleGroup>
          </div>

          <If condition={bottomSection === "description"}>
            <Then>
              <ProposalDescription {...proposal} />
            </Then>
            <Else>
              <VetoesSection vetoes={vetoes} />
            </Else>
          </If>
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
