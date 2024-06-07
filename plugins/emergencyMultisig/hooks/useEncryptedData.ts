import { encodeAbiParameters, keccak256, toHex } from "viem";
import { EncryptedProposalMetadata } from "../utils/types";
import { hexToUint8Array } from "@/utils/hex";
import { encryptProposal, encryptSymmetricKey } from "@/utils/encryption";
import { RawAction } from "@/utils/types";
import { usePublicKeyRegistry } from "./usePublicKeyRegistry";

export function useEncryptedData() {
  const {
    data: { publicKeys },
  } = usePublicKeyRegistry();

  const encryptProposalData = (privateMetadata: { [k: string]: any }, actions: RawAction[]) => {
    const actionsBytes = encodeAbiParameters([ACTION_ARRAY_ABI], [actions]);

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

const ACTION_ARRAY_ABI = {
  name: "_actions",
  type: "tuple[]",
  internalType: "struct IDAO.Action[]",
  components: [
    {
      name: "to",
      type: "address",
      internalType: "address",
    },
    {
      name: "value",
      type: "uint256",
      internalType: "uint256",
    },
    {
      name: "data",
      type: "bytes",
      internalType: "bytes",
    },
  ],
} as const;
