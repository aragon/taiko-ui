import { decodeAbiParameters } from "viem";
import { EncryptedProposalMetadata } from "../utils/types";
import { hexToUint8Array } from "@/utils/hex";
import { decryptProposal, decryptSymmetricKey } from "@/utils/encryption";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { useDerivedWallet } from "./useDerivedWallet";
import { RawActionList } from "../artifacts/RawActionList";

export function useDecryptedData(encryptedMetadata: EncryptedProposalMetadata) {
  const { privateKey, publicKey } = useDerivedWallet();
  let privateMetadata: ProposalMetadata | null = null;
  let privateActions: readonly RawAction[] | null = null;
  let error: Error | null = null;

  // Attempt to decrypt
  if (privateKey && publicKey) {
    const pubKeys = encryptedMetadata.encrypted.symmetricKeys.map((pk) => hexToUint8Array(pk));
    try {
      const proposalSymKey = decryptSymmetricKey(pubKeys, { privateKey, publicKey });
      const result = decryptProposal(
        {
          metadata: encryptedMetadata.encrypted.metadata,
          actions: encryptedMetadata.encrypted.actions,
        },
        proposalSymKey
      );
      privateMetadata = result.metadata as any;
      const decoded = decodeAbiParameters(RawActionList, result.actions);
      if (!decoded[0]) throw new Error("The actions parameter can't be recovered");

      privateActions = decoded[0];
    } catch (err) {
      error = err as Error;
    }
  }

  return {
    privateActions,
    privateMetadata,
    error,
  };
}
