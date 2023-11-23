import { Proposal } from "@/utils/types"

export default function ProposalDescription(proposal: Proposal) {
  return (
    <div className="pt-8">
      <p>{proposal?.summary}</p>
      <h2 className="flex-grow text-2xl text-neutral-900 font-semibold">To execute</h2>
      <div className="flex flex-row space-between">
        {proposal.actions?.length && proposal.actions.map((action) => (
          <div key={`${action.to}-${action.value}-${action.data}`}>
            <p>To: {action.to}</p>
            <p>Value: {Number(action.value)}</p>
            <p>Data: {action.data}</p>
          </div>
        ))
        }
      </div>
    </div>
  )
}