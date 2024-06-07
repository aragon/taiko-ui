import { encodeAbiParameters, keccak256, toHex } from "viem";
import { EncryptedProposalMetadata } from "../utils/types";
import { hexToUint8Array } from "@/utils/hex";
import { encryptProposal, encryptSymmetricKey } from "@/utils/encryption";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { usePublicKeyRegistry } from "./usePublicKeyRegistry";
import { RawActionList } from "../artifacts/RawActionList";

export function useEncryptedData() {
  const {
    data: { publicKeys },
  } = usePublicKeyRegistry();

  const encryptProposalData = (privateMetadata: ProposalMetadata, actions: RawAction[]) => {
    const actionsBytes = encodeAbiParameters(RawActionList, [actions]);

    const { data: cipherData, symmetricKey } = encryptProposal(privateMetadata, hexToUint8Array(actionsBytes));
    const encryptedSymKeys = encryptSymmetricKey(
      symmetricKey,
      publicKeys.map((pk) => hexToUint8Array(pk))
    );
    const actionsHash = keccak256(actionsBytes);

    const payload: EncryptedProposalMetadata = {
      encrypted: {
        metadata: cipherData.metadata,
        actions: cipherData.actions,
        symmetricKeys: encryptedSymKeys.map((k) => toHex(k)),
      },
    };

    return {
      payload,
      actionsHash,
    };
  };

  return {
    encryptProposalData,
  };
}
