import { useDerivedWallet } from "../../../hooks/useDerivedWallet";
import { useIsContract } from "@/hooks/useIsContract";
import { useEncryptionRegistry } from "./useEncryptionRegistry";
import { useMultisigMembers } from "@/plugins/members/hooks/useMultisigMembers";
import { Address } from "viem";
import { ADDRESS_ZERO, BYTES32_ZERO } from "@/utils/evm";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "./useCanCreateProposal";

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
  appointedWallet: Address | undefined;
};

export function useAccountEncryptionStatus({}: HookProps = {}): HookResult {
  const { publicKey: derivedPubKey } = useDerivedWallet();
  const { address: selfAddress, isConnected } = useAccount();
  const { canCreate } = useCanCreateProposal();
  const { isContract } = useIsContract(selfAddress);
  const { data: encryptionRegMembers, isLoading: isLoadingPubKeys } = useEncryptionRegistry();

  const { members: multisigMembers } = useMultisigMembers();
  const encryptionMember = encryptionRegMembers.find(
    (item) => item.address === selfAddress || item.appointedWallet === selfAddress
  );
  const isMultisigMember = multisigMembers.includes(selfAddress!) || encryptionMember?.appointedWallet == selfAddress;

  let status: AccountEncryptionStatus;

  let appointedWallet: Address | undefined;
  if (encryptionMember?.appointedWallet && encryptionMember.appointedWallet !== ADDRESS_ZERO) {
    appointedWallet = encryptionMember.appointedWallet;
  }

  if (isLoadingPubKeys) status = AccountEncryptionStatus.LOADING_ENCRYPTION_MEMBERS;
  else if (!selfAddress || !isConnected) status = AccountEncryptionStatus.NOT_CONNECTED;
  else if (!isMultisigMember) status = AccountEncryptionStatus.NOT_A_MULTISIG_MEMBER;
  else if (!canCreate) status = AccountEncryptionStatus.CANNOT_CREATE;
  // We are a contract: limited
  else if (isContract) {
    if (!encryptionMember || !appointedWallet) status = AccountEncryptionStatus.MUST_APPOINT;
    else status = AccountEncryptionStatus.SMART_CONTRACTS_CANNOT_DECRYPT;
  }
  // We are a wallet
  else if (!encryptionMember || encryptionMember.publicKey === BYTES32_ZERO)
    status = AccountEncryptionStatus.PUB_KEY_NOT_SET;
  else if (!appointedWallet && appointedWallet !== selfAddress) {
    status = AccountEncryptionStatus.NOT_APPOINTED;
  } else if (!derivedPubKey) status = AccountEncryptionStatus.NOT_SIGNED_IN;
  else status = AccountEncryptionStatus.READY;

  return { status, appointedWallet };
}
