import { useState, useEffect } from "react";
import { MultisigProposal } from "@/plugins/multisig/utils/types";
import { ProposalStatus } from "@aragon/ods";
import dayjs from "dayjs";

export const useProposalVariantStatus = (proposal: MultisigProposal) => {
  const [status, setStatus] = useState({ variant: "", label: "" });

  useEffect(() => {
    if (!proposal || !proposal?.parameters) return;
    setStatus(
      proposal?.approvals >= proposal?.parameters?.minApprovals
        ? proposal?.executed
          ? { variant: "success", label: "Executed" }
          : { variant: "success", label: "Executable" }
        : dayjs().isAfter(dayjs(Number(proposal?.parameters.expirationDate) * 1000))
          ? { variant: "critical", label: "Failed" }
          : { variant: "info", label: "Active" }
    );
  }, [proposal, proposal?.approvals, proposal?.executed, proposal?.parameters?.minApprovals]);

  return status;
};

export const useProposalStatus = (proposal: MultisigProposal) => {
  const [status, setStatus] = useState<ProposalStatus>();

  useEffect(() => {
    if (!proposal || !proposal?.parameters) return;
    setStatus(
      proposal?.approvals >= proposal?.parameters?.minApprovals
        ? proposal?.executed
          ? "executed"
          : "accepted"
        : dayjs().isAfter(dayjs(Number(proposal?.parameters.expirationDate) * 1000))
          ? "failed"
          : "active"
    );
  }, [proposal, proposal?.approvals, proposal?.executed, proposal?.parameters?.minApprovals]);

  return status;
};
