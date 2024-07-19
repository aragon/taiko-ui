import { useState, useEffect } from "react";
import { OptimisticProposal } from "@/plugins/optimistic-proposals/utils/types";
import { ProposalStatus } from "@aragon/ods";
import { useVotingToken } from "./useVotingToken";
import { PUB_TAIKO_BRIDGE_ADDRESS } from "@/constants";
import { useVotingTokenBalance } from "./useVotingTokenBalance";

export const useProposalVariantStatus = (proposal: OptimisticProposal) => {
  const [status, setStatus] = useState({ variant: "", label: "" });
  const { tokenSupply: totalSupply } = useVotingToken();
  const { balance: bridgedBalance } = useVotingTokenBalance(
    PUB_TAIKO_BRIDGE_ADDRESS,
    proposal?.parameters.snapshotTimestamp || BigInt(0)
  );

  useEffect(() => {
    if (!proposal || !proposal?.parameters || !totalSupply || typeof bridgedBalance === "undefined") return;

    const effectiveSupply = proposal.parameters.skipL2 ? totalSupply - bridgedBalance : totalSupply;
    const minVetoVotingPower = (effectiveSupply * BigInt(proposal.parameters.minVetoRatio)) / BigInt(1_000_000);

    setStatus(
      proposal?.vetoTally >= minVetoVotingPower
        ? { variant: "critical", label: "Defeated" }
        : proposal?.active
          ? { variant: "info", label: "Active" }
          : proposal?.executed
            ? { variant: "primary", label: "Executed" }
            : { variant: "success", label: "Executable" }
    );
  }, [
    proposal?.vetoTally,
    proposal?.active,
    proposal?.executed,
    proposal?.parameters?.minVetoRatio,
    totalSupply,
    bridgedBalance,
  ]);

  return status;
};

export const useProposalStatus = (proposal: OptimisticProposal) => {
  const [status, setStatus] = useState<ProposalStatus>();
  const { tokenSupply: totalSupply } = useVotingToken();
  const { balance: bridgedBalance } = useVotingTokenBalance(
    PUB_TAIKO_BRIDGE_ADDRESS,
    proposal?.parameters.snapshotTimestamp || BigInt(0)
  );

  useEffect(() => {
    if (!proposal || !proposal?.parameters || !totalSupply || typeof bridgedBalance === "undefined") return;

    const effectiveSupply = proposal.parameters.skipL2 ? totalSupply - bridgedBalance : totalSupply;
    const minVetoVotingPower = (effectiveSupply * BigInt(proposal.parameters.minVetoRatio)) / BigInt(1_000_000);

    setStatus(
      proposal?.vetoTally >= minVetoVotingPower
        ? "vetoed"
        : proposal?.active
          ? "active"
          : proposal?.executed
            ? "executed"
            : "accepted"
    );
  }, [
    proposal?.vetoTally,
    proposal?.active,
    proposal?.executed,
    proposal?.parameters?.minVetoRatio,
    totalSupply,
    bridgedBalance,
  ]);

  return status;
};
