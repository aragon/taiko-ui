export function parseProposalId(proposalId: bigint) {
  const mask64Bit = BigInt("0xffffffffffffffff");
  const index = Number(proposalId & mask64Bit);
  const startDate = proposalId & ((mask64Bit << BigInt(128)) >> BigInt(128));
  const endDate = proposalId & ((mask64Bit << BigInt(64)) >> BigInt(64));

  return { index, startDate, endDate };
}
