import { type useProposal } from "@/plugins/dualGovernance/hooks/useProposal";
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
import { useProposalId } from "../hooks/useProposalId";

type BottomSection = "description" | "vetoes";

export default function ProposalDetail({ index: proposalIndex }: { index: number }) {
  const [bottomSection, setBottomSection] = useState<BottomSection>("description");
  const { proposalId } = useProposalId(proposalIndex);
  const {
    proposal,
    proposalFetchStatus,
    vetoes,
    canVeto,
    isConfirming: isConfirmingVeto,
    vetoProposal,
  } = useProposalVeto(proposalIndex);

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
    <main className="flex w-full flex-col items-center px-4 py-6 md:w-4/5 md:p-6 lg:w-2/3 xl:py-10 2xl:w-3/5">
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
          votePercentage={Number(Number(proposal?.vetoTally) / Number(proposal?.parameters?.minVetoVotingPower)) * 100}
        />
        <ProposalDetails
          minVetoRatio={proposal?.parameters?.minVetoRatio}
          snapshotTimestamp={proposal?.parameters?.snapshotTimestamp}
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
    </main>
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
