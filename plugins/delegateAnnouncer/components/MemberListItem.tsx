import { If } from "@/components/if";
import { formatHexString, equalAddresses } from "@/utils/evm";
import { type IDataListItemProps, DataList, MemberAvatar, Tag, formatterUtils, NumberFormat } from "@aragon/ods";
// import { useDelegateVotingPower } from "@/plugins/erc20Votes/hooks/useDelegateVotingPower";
import { useAccount } from "wagmi";
// import { useDelegateAnnounce } from "../hooks/useDelegateAnnounce";
import { Address } from "viem";

export interface IMemberDataListItemProps extends IDataListItemProps {
  /** Whether the member is a delegate of current user or not */
  isMyDelegate?: boolean;
  /** 0x address of the user */
  address: Address;
  /** Direct URL src of the user avatar image to be rendered */
  avatarSrc?: string;
}

export const MemberListItem: React.FC<IMemberDataListItemProps> = (props) => {
  const { isMyDelegate, avatarSrc, address, ...otherProps } = props;
  const { address: currentUserAddress, isConnected } = useAccount();
  const isCurrentUser = isConnected && address && equalAddresses(currentUserAddress, address);

  const votingPower = 0; // useVotingPower(address);

  return (
    <DataList.Item className="min-w-fit !py-0 px-4 md:px-6" {...otherProps}>
      <div className="flex flex-col items-start justify-center gap-y-3 py-4 md:min-w-44 md:py-6">
        <div className="flex w-full items-center justify-between">
          <MemberAvatar address={address} avatarSrc={avatarSrc} responsiveSize={{ md: "md" }} />
          {isMyDelegate && !isCurrentUser && <Tag variant="info" label="Your Delegate" />}
          {isCurrentUser && <Tag variant="neutral" label="You" />}
        </div>

        <p className="inline-block w-full truncate text-lg text-neutral-800 md:text-xl">{formatHexString(address)}</p>

        <If condition={votingPower}>
          <div className="flex h-12 flex-col gap-y-2">
            <p className="text-sm md:text-base">
              {formatterUtils.formatNumber(votingPower, { format: NumberFormat.GENERIC_SHORT })}
              <span className="text-neutral-500"> Voting Power</span>
            </p>
          </div>
        </If>
      </div>
    </DataList.Item>
  );
};
