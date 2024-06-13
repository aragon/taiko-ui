import { encodeAbiParameters, keccak256, toBytes, toHex } from "viem";
import { EncryptedProposalMetadata } from "../utils/types";
import { hexToUint8Array } from "@/utils/hex";
import { encryptProposal, encryptSymmetricKey } from "@/utils/encryption";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { usePublicKeyRegistry } from "./usePublicKeyRegistry";
import { RawActionListAbi } from "../artifacts/RawActionListAbi";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";

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
    const bytes = raw.encode(toBytes(strMetadata));
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, raw.code, hash);
    const metadataUri = "ipfs://" + cid.toV1().toString();
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
