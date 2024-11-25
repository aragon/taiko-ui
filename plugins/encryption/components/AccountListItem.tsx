import { Else, If, Then } from "@/components/if";
import { formatHexString, equalAddresses, ADDRESS_ZERO } from "@/utils/evm";
import { type IDataListItemProps, DataList, MemberAvatar, Tag } from "@aragon/ods";
import { useAccount } from "wagmi";
import { Address, Hex } from "viem";
import { AccountEncryptionStatus, useAccountEncryptionStatus } from "../hooks/useAccountEncryptionStatus";
import { AddressText } from "@/components/text/address";

export interface IAccountListItemProps extends IDataListItemProps {
  /** 0x address of the account owner */
  owner: Address;
  /** Address of the EOA appointed (if any) */
  appointedWallet?: Address;
  /** The public key of the appointed wallet */
  publicKey?: Hex;
  /** Direct URL src of the user avatar image to be rendered */
  avatarSrc?: string;
}

export const AccountListItemReady: React.FC<IAccountListItemProps> = (props) => {
  const { avatarSrc, owner, appointedWallet, publicKey, ...otherProps } = props;
  const { address: currentUserAddress, isConnected } = useAccount();
  const isCurrentUser = isConnected && owner && equalAddresses(currentUserAddress, owner);
  const selfAppointed = !appointedWallet || appointedWallet === ADDRESS_ZERO;

  return (
    <DataList.Item className="min-w-fit !py-0 px-4 md:px-6" {...otherProps}>
      <div className="flex flex-col items-start justify-center gap-y-3 py-4 md:min-w-44 md:py-6">
        <div className="flex w-full items-center justify-between">
          <MemberAvatar address={owner} avatarSrc={avatarSrc} responsiveSize={{ md: "md" }} />
          <If condition={isCurrentUser}>
            <Then>
              <Tag variant="success" label="You" />
            </Then>
            <Else>
              <Tag variant="success" label="Signer" />
            </Else>
          </If>
        </div>

        <p className="inline-block w-full text-lg text-neutral-800 md:text-xl">{formatHexString(owner)}</p>
        <p className="inline-block w-full text-sm text-success-500">
          <If condition={selfAppointed}>
            <Then>The owner can decrypt emergency proposals</Then>
            <Else>Appointed: {appointedWallet === currentUserAddress ? "You" : formatHexString(appointedWallet)}</Else>
          </If>
        </p>
      </div>
    </DataList.Item>
  );
};

export const AccountListItemPending: React.FC<IAccountListItemProps> = (props) => {
  const { avatarSrc, owner, appointedWallet, publicKey, ...otherProps } = props;
  const { address: currentUserAddress, isConnected } = useAccount();
  const isCurrentUser = isConnected && owner && equalAddresses(currentUserAddress, owner);
  const { status } = useAccountEncryptionStatus(owner);

  let comment = "";
  switch (status) {
    case AccountEncryptionStatus.LOADING_ENCRYPTION_STATUS:
      comment = "Loading status";
      break;
    case AccountEncryptionStatus.ERR_COULD_NOT_LOAD:
      comment = "Cannot load status";
      break;
    // case AccountEncryptionStatus.ERR_NOT_LISTED_OR_APPOINTED:
    case AccountEncryptionStatus.ERR_SMART_WALLETS_CANNOT_REGISTER_PUB_KEY:
      comment = "The owner cannot define a public key as a smart wallet";
      break;
    case AccountEncryptionStatus.WARN_APPOINTED_MUST_REGISTER_PUB_KEY:
    case AccountEncryptionStatus.CTA_APPOINTED_MUST_REGISTER_PUB_KEY:
      comment = "No public key defined";
      break;
    case AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT:
      comment = "The owner needs to appoint a wallet";
      break;
    case AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT_OR_REGISTER_PUB_KEY:
      comment = "The owner needs to define a public key or appoint a wallet";
      break;
    // case AccountEncryptionStatus.READY_CAN_CREATE:
    // case AccountEncryptionStatus.READY_ALL:
  }

  return (
    <DataList.Item className="min-w-fit !py-0 px-4 md:px-6" {...otherProps}>
      <div className="flex flex-col items-start justify-center gap-y-3 py-4 md:min-w-44 md:py-6">
        <div className="flex w-full items-center justify-between">
          <MemberAvatar address={owner} avatarSrc={avatarSrc} responsiveSize={{ md: "md" }} />
          <If condition={isCurrentUser}>
            <Then>
              <Tag variant="warning" label="You" />
            </Then>
            <Else>
              <Tag variant="warning" label="Signer" />
            </Else>
          </If>
        </div>

        <p className="inline-block w-full text-lg text-neutral-800 md:text-xl">{formatHexString(owner)}</p>
        <If condition={!!appointedWallet && appointedWallet !== ADDRESS_ZERO}>
          <p className="inline-block w-full text-sm text-neutral-400">
            Appointed: {appointedWallet === currentUserAddress ? "You" : <AddressText>{appointedWallet}</AddressText>}
          </p>
        </If>
        <If condition={!!comment}>
          <p className="inline-block w-full text-sm text-primary-300">{comment}</p>
        </If>
      </div>
    </DataList.Item>
  );
};
