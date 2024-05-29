import { useProposal } from "@/plugins/dualGovernance/hooks/useProposal";
import { ToggleGroup, Toggle } from "@aragon/ods";
import ProposalDescription from "@/plugins/dualGovernance/components/proposal/description";
import VetoesSection from "@/plugins/dualGovernance/components/vote/vetoes-section";
import ProposalHeader from "@/plugins/dualGovernance/components/proposal/header";
import VetoTally from "@/plugins/dualGovernance/components/vote/tally";
import ProposalDetails from "@/plugins/dualGovernance/components/proposal/details";
import { Else, If, Then } from "@/components/if";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useState } from "react";
import { useProposalVeto } from "@/plugins/dualGovernance/hooks/useProposalVeto";
import { useProposalExecute } from "@/plugins/dualGovernance/hooks/useProposalExecute";

type BottomSection = "description" | "vetoes";

export default function ProposalDetail({ id: proposalId }: { id: string }) {
  const [bottomSection, setBottomSection] = useState<BottomSection>("description");

  const {
    proposal,
    proposalFetchStatus,
    vetoes,
    canVeto,
    isConfirming: isConfirmingVeto,
    vetoProposal,
  } = useProposalVeto(proposalId);

  const showProposalLoading = getShowProposalLoading(proposal, proposalFetchStatus);

  const { executeProposal, canExecute, isConfirming: isConfirmingExecution } = useProposalExecute(proposalId);

  if (!proposal || showProposalLoading) {
    return (
      <section className="justify-left items-left flex w-screen min-w-full max-w-full">
        <PleaseWaitSpinner />
      </section>
    );
  }

  return (
    <section className="flex w-screen min-w-full max-w-full flex-col items-center">
      <div className="flex w-full justify-between py-5">
        <ProposalHeader
          proposalNumber={Number(proposalId) + 1}
          proposal={proposal}
          transactionConfirming={isConfirmingVeto || isConfirmingExecution}
          canVeto={canVeto}
          canExecute={canExecute}
          onVetoPressed={() => vetoProposal()}
          onExecutePressed={() => executeProposal()}
        />
      </div>

      <div className="my-10 grid w-full gap-10 lg:grid-cols-2 xl:grid-cols-3">
        <VetoTally
          voteCount={proposal?.vetoTally}
          votePercentage={Number(proposal?.vetoTally / proposal?.parameters?.minVetoVotingPower) * 100}
        />
        <ProposalDetails
          minVetoVotingPower={proposal?.parameters?.minVetoVotingPower}
          snapshotBlock={proposal?.parameters?.snapshotBlock}
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
