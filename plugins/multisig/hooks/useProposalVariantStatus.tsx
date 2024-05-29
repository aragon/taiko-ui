import { useState, useEffect } from "react";
import { Proposal } from "@/plugins/multisig/utils/types";
import { ProposalStatus } from "@aragon/ods";

export const useProposalVariantStatus = (proposal: Proposal) => {
  const [status, setStatus] = useState({ variant: "", label: "" });

  useEffect(() => {
    if (!proposal || !proposal?.parameters) return;
    setStatus(
      proposal?.approvals >= proposal?.parameters?.minApprovals
        ? proposal?.executed
          ? { variant: "success", label: "Executed" }
          : { variant: "success", label: "Executable" }
        : proposal?.parameters.endDate < Date.now()
          ? { variant: "critical", label: "Failed" }
          : { variant: "info", label: "Active" }
    );
  }, [proposal, proposal?.approvals, proposal?.executed, proposal?.parameters?.minApprovals]);

  return status;
};

export const useProposalStatus = (proposal: Proposal) => {
  const [status, setStatus] = useState<ProposalStatus>();

  useEffect(() => {
    if (!proposal || !proposal?.parameters) return;
    setStatus(
      proposal?.approvals >= proposal?.parameters?.minApprovals
        ? proposal?.executed
          ? "executed"
          : "accepted"
        : proposal?.parameters.endDate < Date.now()
          ? "failed"
          : "active"
    );
  }, [proposal, proposal?.approvals, proposal?.executed, proposal?.parameters?.minApprovals]);

  return status;
};
