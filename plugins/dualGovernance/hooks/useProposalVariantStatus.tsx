import { useState, useEffect } from "react";
import { Proposal } from "@/plugins/dualGovernance/utils/types";
import { ProposalStatus } from "@aragon/ods";

export const useProposalVariantStatus = (proposal: Proposal) => {
  const [status, setStatus] = useState<ProposalStatus>();

  useEffect(() => {
    if (!proposal || !proposal?.parameters) return;
    setStatus(
      proposal?.vetoTally >= proposal?.parameters?.minVetoVotingPower
        ? "vetoed"
        : proposal?.active
          ? "active"
          : proposal?.executed
            ? "executed"
            : "accepted"
    );
  }, [proposal?.vetoTally, proposal?.active, proposal?.executed, proposal?.parameters?.minVetoVotingPower]);

  return status;
};
