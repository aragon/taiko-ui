import { useDerivedWallet } from "../../../hooks/useDerivedWallet";
import { useIsContract } from "@/hooks/useIsContract";
import { useEncryptionRegistry } from "./useEncryptionRegistry";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";
import { Address } from "viem";
import { ADDRESS_ZERO, BYTES32_ZERO } from "@/utils/evm";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../../emergency-multisig/hooks/useCanCreateProposal";

export enum AccountEncryptionStatus {
  LOADING_ENCRYPTION_MEMBERS,
  NOT_CONNECTED,
  NOT_A_MULTISIG_MEMBER,
  CANNOT_CREATE,
  MUST_APPOINT,
  PUB_KEY_NOT_SET,
  SMART_CONTRACTS_CANNOT_DECRYPT,
  NOT_APPOINTED,
  NOT_SIGNED_IN,
  READY,
}

type HookProps = {};
type HookResult = {
  status: AccountEncryptionStatus;
  owner: Address | undefined;
  appointedWallet: Address | undefined;
};

export function useAccountEncryptionStatus({}: HookProps = {}): HookResult {
  const { publicKey: derivedPubKey } = useDerivedWallet();
  const { address: selfAddress, isConnected } = useAccount();
  const { canCreate } = useCanCreateProposal();
  const { isContract } = useIsContract(selfAddress);
  const { data: encryptionAccounts, isLoading: isLoadingPubKeys } = useEncryptionRegistry();

  const { signers } = useSignerList();
  const encryptionAccount = encryptionAccounts.find(
    (item) => item.owner === selfAddress || item.appointedWallet === selfAddress
  );
  const isListedOrAppointed = signers.includes(selfAddress!) || encryptionAccount?.appointedWallet == selfAddress;

  let status: AccountEncryptionStatus;

  const owner = encryptionAccount?.owner;
  let appointedWallet: Address | undefined;
  if (encryptionAccount?.appointedWallet && encryptionAccount.appointedWallet !== ADDRESS_ZERO) {
    appointedWallet = encryptionAccount.appointedWallet;
  }

  if (!selfAddress || !isConnected) status = AccountEncryptionStatus.NOT_CONNECTED;
  else if (isLoadingPubKeys) status = AccountEncryptionStatus.LOADING_ENCRYPTION_MEMBERS;
  else if (!isListedOrAppointed || !encryptionAccount || !owner) status = AccountEncryptionStatus.NOT_A_MULTISIG_MEMBER;
  else if (!canCreate) status = AccountEncryptionStatus.CANNOT_CREATE;
  // We are a contract: limited
  else if (isContract) {
    if (!encryptionAccount || !appointedWallet) status = AccountEncryptionStatus.MUST_APPOINT;
    else status = AccountEncryptionStatus.SMART_CONTRACTS_CANNOT_DECRYPT;
  }
  // We are a wallet
  else if (encryptionAccount.publicKey === BYTES32_ZERO) status = AccountEncryptionStatus.PUB_KEY_NOT_SET;
  else if (!derivedPubKey) status = AccountEncryptionStatus.NOT_SIGNED_IN;
  else status = AccountEncryptionStatus.READY;

  return { status, owner, appointedWallet };
}
