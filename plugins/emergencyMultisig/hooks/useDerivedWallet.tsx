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
  requestSignature: () => Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }>;
};

const DerivedWalletContext = createContext<Result>({
  requestSignature: () => Promise.resolve({ publicKey: new Uint8Array(), privateKey: new Uint8Array() }),
});

export function UseDerivedWalletProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  const { addAlert } = useAlerts();
  const [keys, setKeys] = useState<KeyPair>({});

  const requestSignature = async () => {
    try {
      const privateSignature = await signMessage(config, { message: DETERMINISTIC_EMERGENCY_PAYLOAD });
      const derivedPrivateKey = keccak256(privateSignature);
      const publicKey = computePublicKey(hexToUint8Array(derivedPrivateKey));

      const value = {
        publicKey,
        privateKey: hexToUint8Array(derivedPrivateKey),
      };
      setKeys(value);
      return value;
    } catch (err) {
      if ((err as Error)?.message.includes("User rejected the request")) {
        addAlert("You canceled the signature");
        return;
      }
    }

    addAlert("The signature could not be retrieved", { type: "error" });
    throw new Error("Could not load");
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
