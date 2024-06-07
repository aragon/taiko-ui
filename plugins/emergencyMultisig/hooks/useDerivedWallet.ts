import { useState } from "react";
import { keccak256 } from "viem";
import { signMessage } from "@wagmi/core";
import { computePublicKey } from "@/utils/encryption/asymmetric";
import { useConfig } from "wagmi";
import { hexToUint8Array } from "@/utils/hex";
import { DETERMINISTIC_EMERGENCY_PAYLOAD } from "@/constants";

type KeyPair = {
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
};

export function useDerivedWallet() {
  const config = useConfig();
  const [{ privateKey, publicKey }, setKeys] = useState<KeyPair>({});

  const requestSignature = async () => {
    const privateSignature = await signMessage(config, { message: DETERMINISTIC_EMERGENCY_PAYLOAD });
    const derivedPrivateKey = keccak256(privateSignature);
    const publicKey = computePublicKey(hexToUint8Array(derivedPrivateKey));

    setKeys({
      publicKey,
      privateKey: hexToUint8Array(derivedPrivateKey),
    });

    return { publicKey, privateKey: derivedPrivateKey };
  };

  return {
    requestSignature,
    publicKey,
    privateKey,
  };
}
