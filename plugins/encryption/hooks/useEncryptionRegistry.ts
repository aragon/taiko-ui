import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { EncryptionRegistryAbi } from "../artifacts/EncryptionRegistry";
import { PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS } from "@/constants";
import { uint8ArrayToHex } from "@/utils/hex";
import { useDerivedWallet } from "@/hooks/useDerivedWallet";
import { useAlerts } from "@/context/Alerts";
import { debounce } from "@/utils/debounce";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { useEncryptionAccounts } from "./useEncryptionAccounts";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";

/**
 * Returns methods to interact with the Encryption Registry smart contract
 */
export function useEncryptionRegistry({ onAppointSuccess }: { onAppointSuccess?: () => any } = {}) {
  const { address } = useAccount();
  const { addAlert } = useAlerts();
  const [isWaiting, setIsWaiting] = useState(false);
  const { publicKey, requestSignature } = useDerivedWallet();
  const { data: accounts, refetch } = useEncryptionAccounts();
  const { signers, isLoading } = useSignerList();

  // Set public key transaction
  const { writeContract: setPubKeyWrite, isConfirming: isConfirmingPubK } = useTransactionManager({
    // OK
    onSuccessMessage: "Public key registered",
    onSuccess() {
      setTimeout(() => refetch(), 1000 * 2);
      setIsWaiting(false);
    }, // Err
    onErrorMessage: "Could not register the public key",
    onError() {
      debounce(() => refetch(), 800);
      setIsWaiting(false);
    },
  });

  // Appoint wallet
  const { writeContract: appointWalletWrite, isConfirming: isConfirmingAppoint } = useTransactionManager({
    // OK
    onSuccessMessage: "The wallet has been appointed",
    onSuccessDescription: "The appointed wallet will be able to decrypt future emergency proposals",
    onSuccess() {
      setTimeout(() => refetch(), 1000 * 2);
      setIsWaiting(false);
      onAppointSuccess?.();
    },
    // Err
    onErrorMessage: "Could not appoint the wallet",
    onError() {
      debounce(() => refetch(), 800);
      setIsWaiting(false);
    },
  });

  const registerPublicKey = async () => {
    const account = accounts?.find((m) => m.owner === address || m.appointedWallet === address);
    if (!account) {
      addAlert("You are not currently a registered signer or appointed member", { type: "error" });
      return;
    }

    setIsWaiting(true);

    try {
      let pubK: Uint8Array | undefined = publicKey;
      if (!pubK) {
        const keys = await requestSignature();
        pubK = keys.publicKey;
      }

      if (account.owner === address) {
        setPubKeyWrite({
          abi: EncryptionRegistryAbi,
          address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
          functionName: "setOwnPublicKey",
          args: [uint8ArrayToHex(pubK)],
        });
      } else {
        setPubKeyWrite({
          abi: EncryptionRegistryAbi,
          address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
          functionName: "setPublicKey",
          args: [account.owner, uint8ArrayToHex(pubK)],
        });
      }
    } catch (err) {
      setIsWaiting(false);
    }
  };

  const appointWallet = (walletToAppoint: Address) => {
    if (!address || isLoading) {
      addAlert("Please connect your wallet");
      return;
    } else if (!signers?.includes(address)) {
      addAlert("You are not currently listed as a Security Member signer", { type: "error" });
      return;
    }

    setIsWaiting(true);

    appointWalletWrite({
      abi: EncryptionRegistryAbi,
      address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
      functionName: "appointWallet",
      args: [walletToAppoint],
    });
  };

  return {
    appointWallet,
    registerPublicKey,
    isConfirming: isWaiting || isConfirmingPubK || isConfirmingAppoint,
  };
}
