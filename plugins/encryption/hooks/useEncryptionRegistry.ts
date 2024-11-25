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
import { AccountEncryptionStatus, useAccountEncryptionStatus } from "./useAccountEncryptionStatus";

/**
 * Returns methods to interact with the Encryption Registry smart contract
 */
export function useEncryptionRegistry({ onAppointSuccess }: { onAppointSuccess?: () => any } = {}) {
  const { address } = useAccount();
  const { addAlert } = useAlerts();
  const [isWaiting, setIsWaiting] = useState(false);
  const { publicKey: derivedPublicKey, requestSignature } = useDerivedWallet();
  const { data: accounts, refetch } = useEncryptionAccounts();
  const { signers, isLoading } = useSignerList();
  const { owner: accountOwner, appointedWallet, status: accountStatus } = useAccountEncryptionStatus(address);

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

  const registerPublicKey = async (target: "own" | "appointed") => {
    switch (accountStatus) {
      case AccountEncryptionStatus.LOADING_ENCRYPTION_STATUS:
        addAlert("Please, wait until the status loaded");
        return;
      case AccountEncryptionStatus.ERR_COULD_NOT_LOAD:
        addAlert("Could not load the account status", { type: "error" });
        return;
      case AccountEncryptionStatus.ERR_NOT_LISTED_OR_APPOINTED:
        addAlert("You are not currently a listed signer or an appointed wallet", { type: "error" });
        return;
      case AccountEncryptionStatus.ERR_SMART_WALLETS_CANNOT_REGISTER_PUB_KEY:
        addAlert("Smart wallets cannot register a public key", { type: "error" });
        return;
    }

    setIsWaiting(true);

    try {
      let pubK: Uint8Array | undefined = derivedPublicKey;
      if (!pubK) {
        const keys = await requestSignature();
        pubK = keys.publicKey;
      }

      if (target === "own") {
        setPubKeyWrite({
          abi: EncryptionRegistryAbi,
          address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
          functionName: "setOwnPublicKey",
          args: [uint8ArrayToHex(pubK)],
        });
      } else {
        // Define public key as the appointed wallet
        if (!accountOwner) throw new Error("Could not load the owner account status");

        setPubKeyWrite({
          abi: EncryptionRegistryAbi,
          address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
          functionName: "setPublicKey",
          args: [accountOwner, uint8ArrayToHex(pubK)],
        });
      }
    } catch (err: any) {
      if (err.message === "Could not load the owner account status") {
        addAlert("Could not load the owner account status", { type: "error" });
      } else {
        addAlert("Could not complete the operation", { type: "error" });
      }

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
