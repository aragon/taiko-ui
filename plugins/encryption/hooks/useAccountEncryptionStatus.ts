import { useIsContract } from "@/hooks/useIsContract";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";
import { useEncryptionAccounts } from "./useEncryptionAccounts";
import { Address, Hex } from "viem";
import { ADDRESS_ZERO, BYTES32_ZERO } from "@/utils/evm";
import { useAccount } from "wagmi";

export enum AccountEncryptionStatus {
  LOADING_ENCRYPTION_STATUS,
  ERR_COULD_NOT_LOAD,
  ERR_NOT_LISTED_OR_APPOINTED,
  /** When appointing an address that is a smart contract */
  ERR_APPOINTED_A_SMART_WALLET_CANNOT_GENERATE_PUBLIC_KEY,
  /** The current user is the owner and the appointed wallet hasn't registered the public key yet */
  WARN_APPOINTED_MUST_REGISTER_PUB_KEY,
  /** The current user is the appointed wallet and it needs to register the public key */
  CTA_APPOINTED_MUST_REGISTER_PUB_KEY,
  /** The owner is a smart wallet and no address is appointed */
  CTA_OWNER_MUST_APPOINT,
  /** The owner is a wallet and no public key or appointed address is defined */
  CTA_OWNER_MUST_APPOINT_OR_REGISTER_PUB_KEY,
  /** The current account can create proposals */
  READY_CAN_CREATE,
  /** The current account can create and decrypt proposals */
  READY_ALL,
}

type HookResult = {
  status: AccountEncryptionStatus;
  owner: Address | undefined;
  appointedWallet: Address | undefined;
  publicKey: Hex | undefined;
};

export function useAccountEncryptionStatus(targetAddress?: Address | undefined): HookResult {
  const { address: selfAddress } = useAccount();
  if (!targetAddress) targetAddress = selfAddress;

  const { data: encryptionAccounts, isLoading: isLoadingEncryptionAccounts, error: error1 } = useEncryptionAccounts();
  const { data: signers, isLoading: isLoadingSigners, error: error2 } = useSignerList();
  const { isContract } = useIsContract(targetAddress);

  const encryptionAccount = (encryptionAccounts || []).find(
    (item) => item.owner === targetAddress || item.appointedWallet === targetAddress
  );
  const owner = encryptionAccount?.owner;
  const registeredPublicKey = encryptionAccount?.publicKey;
  const isListed = signers?.includes(targetAddress!);
  const isAppointed = (encryptionAccounts || []).findIndex((acc) => acc.appointedWallet === targetAddress) >= 0;

  let appointedWallet: Address | undefined;
  if (encryptionAccount?.appointedWallet && encryptionAccount.appointedWallet !== ADDRESS_ZERO) {
    appointedWallet = encryptionAccount.appointedWallet;
  }
  let status: AccountEncryptionStatus;

  if (isLoadingEncryptionAccounts || isLoadingSigners) {
    // Loading
    status = AccountEncryptionStatus.LOADING_ENCRYPTION_STATUS;
  } else if (error1 || error2) {
    // Err
    status = AccountEncryptionStatus.ERR_COULD_NOT_LOAD;
  } else if (!isListed) {
    // Address not listed
    if (!isAppointed) {
      // Err: Not listed or appointed
      status = AccountEncryptionStatus.ERR_NOT_LISTED_OR_APPOINTED;
    } else {
      // Address is appointed (should not be possible)

      // Defined public key?
      if (registeredPublicKey && registeredPublicKey !== BYTES32_ZERO) {
        // OK: Can do all
        status = AccountEncryptionStatus.READY_ALL;
      } else {
        if (isContract) {
          // Error: smart wallets cannot register a public key
          status = AccountEncryptionStatus.ERR_APPOINTED_A_SMART_WALLET_CANNOT_GENERATE_PUBLIC_KEY;
        } else {
          // CTA: Appointed must register pubkey
          status = AccountEncryptionStatus.CTA_APPOINTED_MUST_REGISTER_PUB_KEY;
        }
      }
    }
  } else {
    // Address is a listed signer
    if (isContract) {
      // Address is a smart wallet

      // Is there an appointed wallet?
      if (!appointedWallet || appointedWallet === ADDRESS_ZERO) {
        // CTA: Owner must appoint
        status = AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT;
      } else {
        // There's an appointed wallet

        // Defined public key?
        if (!registeredPublicKey || registeredPublicKey === BYTES32_ZERO) {
          // Warning: Appointed must register pubkey
          status = AccountEncryptionStatus.WARN_APPOINTED_MUST_REGISTER_PUB_KEY;
        } else {
          // OK: Can create
          status = AccountEncryptionStatus.READY_CAN_CREATE;
        }
      }
    } else {
      // Address is an EOA

      // Is there an appointed wallet?
      if (!appointedWallet || appointedWallet === ADDRESS_ZERO) {
        // No appointed wallet

        if (!registeredPublicKey || registeredPublicKey === BYTES32_ZERO) {
          // CTA: Owner must appoint
          // CTA: Owner must define a public key
          status = AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT_OR_REGISTER_PUB_KEY;
        } else {
          // OK: can do all
          status = AccountEncryptionStatus.READY_ALL;
        }
      } else {
        // A wallet is appointed

        // Defined public key?
        if (!registeredPublicKey || registeredPublicKey === BYTES32_ZERO) {
          // Warning: Appointed must register a public key
          status = AccountEncryptionStatus.WARN_APPOINTED_MUST_REGISTER_PUB_KEY;
        } else {
          // OK: Can create
          status = AccountEncryptionStatus.READY_CAN_CREATE;
        }
      }
    }
  }

  return {
    status,
    owner,
    appointedWallet,
    publicKey: registeredPublicKey,
  };
}
