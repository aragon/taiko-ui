import { encodeAbiParameters, keccak256, toHex } from "viem";
import { EncryptedProposalMetadata } from "../utils/types";
import { hexToUint8Array } from "@/utils/hex";
import { encryptProposal, encryptSymmetricKey } from "@/utils/encryption";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { usePublicKeyRegistry } from "./usePublicKeyRegistry";
import { RawActionListAbi } from "../artifacts/RawActionListAbi";
import { getContentCid } from "@/utils/ipfs";

export function useEncryptedData() {
  const {
    data: { publicKeys },
  } = usePublicKeyRegistry();

  const encryptProposalData = async (privateMetadata: ProposalMetadata, actions: RawAction[]) => {
    const actionsBytes = encodeAbiParameters(RawActionListAbi, [actions]);

    // Encrypt data
    const strMetadata = JSON.stringify(privateMetadata);
    const { encrypted: cipherData, symmetricKey } = encryptProposal(strMetadata, hexToUint8Array(actionsBytes));
    const encryptedSymKeys = encryptSymmetricKey(
      symmetricKey,
      publicKeys.map((pk) => hexToUint8Array(pk))
    );

    // Hash the raw actions
    const hashedActions = keccak256(actionsBytes);

    // Compute the CiD of the private metadata and hash it
    const metadataUri = await getContentCid(strMetadata);
    const hashedMetadataUri = keccak256(toHex(metadataUri));

    // Result
    const payload: EncryptedProposalMetadata = {
      encrypted: {
        metadata: cipherData.metadata,
        actions: cipherData.actions,
        symmetricKeys: encryptedSymKeys.map((k) => toHex(k)),
      },
    };
    const hashed = {
      actions: hashedActions,
      metadataUri: hashedMetadataUri,
    };
    return {
      payload,
      hashed,
    };
  };

  return {
    encryptProposalData,
  };
}
