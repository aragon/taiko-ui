import { PUB_TOKEN_SYMBOL } from "@/constants";
import { formatHexString, equalAddresses } from "@/utils/evm";
import {
  Breadcrumbs,
  Button,
  Dropdown,
  Heading,
  IconType,
  MemberAvatar,
  clipboardUtils,
  type IBreadcrumbsLink,
} from "@aragon/ods";
import { formatEther, type Address } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useEnsName } from "wagmi";
import { useGovernanceToken } from "../hooks/useGovernanceToken";
import { Else, ElseIf, If, Then } from "@/components/if";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDelegateVotingPower } from "../hooks/useDelegateVotingPower";
import VerifiedDelegates from "../../../verified-delegates.json";

interface IHeaderMemberProps {
  name?: string;
  address: Address;
  bio?: string;
}

export const HeaderMember: React.FC<IHeaderMemberProps> = (props) => {
  const { address: memberAddress, bio, name } = props;
  const breadcrumbs: IBreadcrumbsLink[] = [{ label: "Delegates", href: "#/" }, { label: props.address }];
  const { open } = useWeb3Modal();
  const { address: connectedAccount, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ chainId: mainnet.id, address: memberAddress });
  const { votingPower, balance: tokenBalance, refetch } = useGovernanceToken(memberAddress);
  const { delegatesTo } = useGovernanceToken(connectedAccount);
  const { delegateVotingPower, isLoading: isConfirming } = useDelegateVotingPower(memberAddress, refetch);
  const formattedAddress = formatHexString(memberAddress);
  const isVerified = VerifiedDelegates.findIndex((d) => equalAddresses(d.address, memberAddress)) >= 0;

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-xl flex-col gap-y-6 px-4 py-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs.map((v) => ({ ...v, label: formatHexString(v.label) }))}
          tag={isVerified ? { label: "Verified", variant: "success" } : { label: "Unverified" }}
        />

        {/* Content Wrapper */}
        <div className="flex flex-col gap-y-4">
          <div className="flex w-full md:gap-x-20">
            <div className="flex w-full max-w-[720px] flex-col gap-y-4">
              <Heading size="h1">{name ?? formattedAddress}</Heading>
              {/* Bio */}
              {bio && <p className="text-lg text-neutral-500">{bio}</p>}
              {/* Stats */}
              <div className="flex flex-row justify-between gap-y-3 py-4 md:justify-normal md:gap-x-16">
                {/* Voting power */}
                <div className="flex flex-col gap-y-1 leading-tight">
                  <div className="flex items-baseline gap-x-1">
                    <span className="text-2xl text-neutral-800">{formatEther(votingPower ?? BigInt(0))}</span>
                    <span className="text-base text-neutral-500">{PUB_TOKEN_SYMBOL}</span>
                  </div>
                  <span className="text-sm text-neutral-500">Voting power</span>
                </div>

                {/* Token Balance */}
                <div className="flex flex-col gap-y-1 leading-tight">
                  <div className="flex items-baseline gap-x-1">
                    <span className="text-2xl text-neutral-800">{formatEther(tokenBalance ?? BigInt(0))}</span>
                    <span className="text-base text-neutral-500">{PUB_TOKEN_SYMBOL}</span>
                  </div>
                  <span className="text-sm text-neutral-500">Token balance</span>
                </div>
              </div>
            </div>
            <span>
              <MemberAvatar address={memberAddress} size="lg" responsiveSize={{}} />
            </span>
          </div>
          <div>
            <span className="flex w-full flex-col gap-x-4 gap-y-3 md:flex-row">
              <If condition={!isConnected}>
                <Then>
                  <Button onClick={() => open()}>Connect to delegate</Button>
                </Then>
                <ElseIf condition={equalAddresses(memberAddress, delegatesTo)}>
                  <Button disabled>Already delegated</Button>
                </ElseIf>
                <ElseIf condition={equalAddresses(memberAddress, connectedAccount)}>
                  <Button isLoading={isConfirming} onClick={delegateVotingPower}>
                    Reclaim voting power
                  </Button>
                </ElseIf>
                <Else>
                  <Button isLoading={isConfirming} onClick={delegateVotingPower}>
                    Delegate voting power
                  </Button>
                </Else>
              </If>

              <Dropdown.Container
                customTrigger={
                  <Button variant="tertiary" iconRight={IconType.CHEVRON_DOWN}>
                    {ensName ?? formattedAddress}
                  </Button>
                }
              >
                <If condition={!!ensName?.trim()}>
                  <Dropdown.Item
                    icon={IconType.COPY}
                    iconPosition="right"
                    onClick={() => clipboardUtils.copy(ensName ?? "")}
                  >
                    {ensName}
                  </Dropdown.Item>
                </If>
                <Dropdown.Item
                  icon={IconType.COPY}
                  iconPosition="right"
                  onClick={() => clipboardUtils.copy(memberAddress)}
                >
                  {formattedAddress}
                </Dropdown.Item>
              </Dropdown.Container>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
