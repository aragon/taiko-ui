import { OptimisticProposal } from "@/plugins/optimistic-proposals/utils/types";
import { If } from "@/components/if";
import * as DOMPurify from "dompurify";
import { ActionCard } from "@/components/actions/action";

const DEFAULT_PROPOSAL_METADATA_SUMMARY = "No description provided.";

export default function ProposalDescription(proposal: OptimisticProposal) {
  return (
    <div className="pt-2">
      <div
        className="pb-6"
        dangerouslySetInnerHTML={{
          __html: proposal.description ? DOMPurify.sanitize(proposal.description) : DEFAULT_PROPOSAL_METADATA_SUMMARY,
        }}
      />
      <h2 className="flex-grow pb-3 pt-10 text-2xl font-semibold text-neutral-900">Actions</h2>
      <div className="">
        <If not={proposal.actions.length}>
          <p className="pt-2">The proposal has no actions</p>
        </If>
        {proposal.actions?.map?.((action, i) => (
          <div className="mb-3" key={i}>
            <ActionCard action={action} idx={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
