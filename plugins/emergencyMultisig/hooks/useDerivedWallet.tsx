import { useState, useContext, createContext, ReactNode } from "react";
import { keccak256 } from "viem";
import { signMessage } from "@wagmi/core";
import { computePublicKey } from "@/utils/encryption/asymmetric";
import { useConfig } from "wagmi";
import { hexToUint8Array } from "@/utils/hex";
import { DETERMINISTIC_EMERGENCY_PAYLOAD } from "@/constants";
import { useAlerts } from "@/context/Alerts";

type KeyPair = {
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
};

type Result = KeyPair & {
  requestSignature: () => any;
};

const DerivedWalletContext = createContext<Result>({ requestSignature: () => {} });

export function UseDerivedWalletProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  const { addAlert } = useAlerts();
  const [keys, setKeys] = useState<KeyPair>({});

  const requestSignature = async () => {
    try {
      const privateSignature = await signMessage(config, { message: DETERMINISTIC_EMERGENCY_PAYLOAD });
      const derivedPrivateKey = keccak256(privateSignature);
      const publicKey = computePublicKey(hexToUint8Array(derivedPrivateKey));

      setKeys({
        publicKey,
        privateKey: hexToUint8Array(derivedPrivateKey),
      });

      return { publicKey, privateKey: derivedPrivateKey };
    } catch (err) {
      if ((err as Error)?.message.includes("User rejected the request")) {
        addAlert("You canceled the signature");
      } else if (!err) {
        addAlert("The signature could not be retrieved", { type: "error" });
      }
    }
  };

  const value = {
    requestSignature,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  };

  return <DerivedWalletContext.Provider value={value}>{children}</DerivedWalletContext.Provider>;
}

export function useDerivedWallet() {
  return useContext(DerivedWalletContext);
}
