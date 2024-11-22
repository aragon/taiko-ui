import { Else, If, Then } from "@/components/if";
import { formatHexString, equalAddresses } from "@/utils/evm";
import { type IDataListItemProps, DataList, MemberAvatar, Tag } from "@aragon/ods";
import { useAccount } from "wagmi";
import { Address, Hex } from "viem";

export interface ISignerListItemProps extends IDataListItemProps {
  /** 0x address of the account owner */
  owner: Address;
  /** Address of the EOA appointed (if any) */
  appointedWallet: Address;
  /** The public key of the appointed wallet */
  publicKey: Hex;
  /** Direct URL src of the user avatar image to be rendered */
  avatarSrc?: string;
}

export const SignerListItem: React.FC<ISignerListItemProps> = (props) => {
  const { avatarSrc, owner, appointedWallet, publicKey, ...otherProps } = props;
  const { address: currentUserAddress, isConnected } = useAccount();
  const isCurrentUser = isConnected && owner && equalAddresses(currentUserAddress, owner);

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

        <p className="inline-block w-full truncate text-lg text-neutral-800 md:text-xl">{formatHexString(owner)}</p>
      </div>
    </DataList.Item>
  );
};
