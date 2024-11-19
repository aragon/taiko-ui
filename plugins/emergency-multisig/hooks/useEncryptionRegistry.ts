import { useState } from "react";
import { EncryptionRegistryAbi } from "../artifacts/EncryptionRegistry";
import { useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { uint8ArrayToHex } from "@/utils/hex";
import { useDerivedWallet } from "../../../hooks/useDerivedWallet";
import { useAlerts } from "@/context/Alerts";
import { debounce } from "@/utils/debounce";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { Address } from "viem";

export function useEncryptionRegistry({ onAppointSuccess }: { onAppointSuccess?: () => any } = {}) {
  const { address } = useAccount();
  const { addAlert } = useAlerts();
  const [isWaiting, setIsWaiting] = useState(false);
  const { publicKey, requestSignature } = useDerivedWallet();
  const { data: accounts, isLoading, error, refetch } = useEncryptionRegistryAccounts();

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

  const appointWallet = (appointedWallet: Address) => {
    const account = accounts?.find((m) => m.owner === address);
    if (!account) {
      addAlert("You are not currently registered on the Encryption Registry", { type: "error" });
      return;
    }

    setIsWaiting(true);

    appointWalletWrite({
      abi: EncryptionRegistryAbi,
      address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
      functionName: "appointWallet",
      args: [appointedWallet],
    });
  };

  return {
    data: accounts ?? [],
    appointWallet,
    registerPublicKey,
    isLoading,
    isConfirming: isWaiting || isConfirmingPubK || isConfirmingAppoint,
    error,
  };
}

function useEncryptionRegistryAccounts() {
  const config = useConfig();

  return useQuery({
    queryKey: ["encryption-registry-members-fetch", PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS],
    queryFn: () => {
      return readContract(config, {
        abi: EncryptionRegistryAbi,
        address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
        functionName: "getRegisteredAccounts",
      }).then((accounts) => {
        return Promise.all(
          accounts.map((accountAddress) =>
            readContract(config, {
              abi: EncryptionRegistryAbi,
              address: PUB_ENCRYPTION_REGISTRY_CONTRACT_ADDRESS,
              functionName: "accounts",
              args: [accountAddress],
            }).then((result) => {
              // zip values
              const [appointedWallet, publicKey] = result;
              return { owner: accountAddress, appointedWallet, publicKey };
            })
          )
        );
      });
    },
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: 1000 * 60 * 5,
  });
}
