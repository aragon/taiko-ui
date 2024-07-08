import { PUB_TOKEN_ADDRESS, PUB_TOKEN_SYMBOL } from "@/constants";
// import { ProposalStages } from "@/features/proposals";
// import { useDelegateVotingPower } from "@/plugins/erc20Votes/hooks/useDelegateVotingPower";
// import { useTokenInfo } from "@/plugins/erc20Votes/hooks/useTokenBalance";
import { formatHexString, equalAddresses } from "@/utils/evm";
// import { queryClient } from "@/utils/query-client";
import {
  Breadcrumbs,
  Button,
  Dropdown,
  Heading,
  IconType,
  MemberAvatar,
  NumberFormat,
  clipboardUtils,
  type IBreadcrumbsLink,
} from "@aragon/ods";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import React from "react";
import { formatEther, formatUnits, zeroAddress, type Address } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useEnsName } from "wagmi";
// import {
//   delegatesList,
//   delegationsList,
//   votingPower as votingPowerQueryOptions,
// } from "../../services/members/query-options";
import classNames from "classnames";
import { useGovernanceToken } from "../hooks/useGovernanceToken";
// import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";

interface IHeaderMemberProps {
  name?: string;
  address: Address;
  bio?: string;
}

export const HeaderMember: React.FC<IHeaderMemberProps> = (props) => {
  const { address: address, bio, name } = props;
  const breadcrumbs: IBreadcrumbsLink[] = [
    {
      label: "Delegates",
      href: "#/",
    },
    {
      label: props.address,
    },
  ];

  const { address: connectedAccount, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ chainId: mainnet.id, address: address });
  const { delegatesTo, votingPower, balance, isLoading } = useGovernanceToken(address);

  // // delegate hooks
  // const isTokenVoting = type === "majorityVoting";
  // const { data: announcementData } = useAnnouncement(address, { enabled: isTokenVoting && !!address });
  // const hasDelegationProfile = !!announcementData?.[0];

  // const { data: delegationCount } = useInfiniteQuery({
  //   ...delegationsList({ address: address }),
  //   select: (data) => data.pages[0]?.pagination?.total ?? 0,
  //   enabled: hasDelegationProfile,
  // });

  // const { data: connectedAccountDelegate, queryKey: delegateQueryKey } = useGovernanceToken(connectedAccount, {
  //   enabled: !!connectedAccount && isTokenVoting,
  // });

  // const { data: tokenData } = useTokenInfo(
  //   { account: address, token: PUB_TOKEN_ADDRESS },
  //   { enabled: !!address && !!PUB_TOKEN_ADDRESS && !!isTokenVoting }
  // );

  // const { data: votingPower } = useQuery({
  //   ...votingPowerQueryOptions({ address: address, stage: ProposalStages.COMMUNITY_VOTING }),
  //   enabled: !!address && isTokenVoting,
  // });

  // // profile is for the connected account
  // const memberIsConnectedAccount = equalAddresses(connectedAccount, address);

  // // profile is for the connected account; self-delegation
  // const connectedMemberIsSelfDelegated =
  //   memberIsConnectedAccount && equalAddresses(connectedAccount, connectedAccountDelegate);

  // // profile is the connected account, but delegation is inactive
  // const connectedMemberDelegationInactive =
  //   memberIsConnectedAccount && equalAddresses(connectedAccountDelegate, zeroAddress);

  // // profile is the delegate of the connected account but not the connected account
  // const memberIsconnectedAccountDelegate =
  //   !memberIsConnectedAccount && equalAddresses(address, connectedAccountDelegate);

  // const mode = memberIsconnectedAccountDelegate || connectedMemberDelegationInactive ? "claim" : "delegate";
  // const { delegateVotingPower, isConfirming } = useDelegateVotingPower(mode, invalidateQueries);

  // stats
  const formattedAddress = formatHexString(address);
  // const tokenDecimals = tokenData?.[1] ?? 18;
  // const tokenBalance = formatUnits(tokenData?.[0] ?? 0n, tokenDecimals);

  // function invalidateQueries() {
  //   // voting power of the previous delegate
  //   queryClient.invalidateQueries({
  //     queryKey: votingPowerQueryOptions({
  //       address: connectedAccountDelegate as Address,
  //       stage: ProposalStages.COMMUNITY_VOTING,
  //     }).queryKey,
  //     type: "all",
  //     refetchType: "all",
  //   });

  //   // invalidate who connected account is delegating to
  //   queryClient.invalidateQueries({ queryKey: delegateQueryKey, type: "all", refetchType: "all" });

  //   // voting power of the member profile address
  //   queryClient.invalidateQueries({
  //     queryKey: votingPowerQueryOptions({ address: address, stage: ProposalStages.COMMUNITY_VOTING }).queryKey,
  //     type: "all",
  //     refetchType: "all",
  //   });

  //   // delegations received
  //   queryClient.invalidateQueries({
  //     queryKey: delegationsList({ address: address }).queryKey,
  //     type: "all",
  //     refetchType: "all",
  //   });

  //   // list of delegates
  //   queryClient.invalidateQueries({
  //     queryKey: delegatesList({ limit: 12 }).queryKey,
  //     type: "all",
  //     refetchType: "all",
  //   });
  // }

  // const getCtaLabel = () => {
  //   if (!isConnected) {
  //     return "Connect to delegate";
  //   } else if (connectedMemberIsSelfDelegated || connectedMemberDelegationInactive) {
  //     return isConfirming ? "Claiming voting power" : "Claim voting power";
  //   } else if (memberIsconnectedAccountDelegate || memberIsConnectedAccount) {
  //     return isConfirming ? "Reclaiming voting power" : "Reclaim voting power";
  //   } else {
  //     return isConfirming ? "Delegating" : "Delegate to";
  //   }
  // };

  const handleCtaClick = () => {
    //   if (memberIsconnectedAccountDelegate || connectedMemberDelegationInactive) {
    //     delegateVotingPower(connectedAccount);
    //   } else {
    //     delegateVotingPower(address);
    //   }
  };

  // const isNeitherCouncilNorDelegate = isTokenVoting && !hasDelegationProfile;
  // const showTag = !isNeitherCouncilNorDelegate;

  const hasDelegationProfile = true;
  const isConfirming = false;
  const connectedMemberIsSelfDelegated = false;

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-xl flex-col gap-y-6 px-4 py-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs.map((v) => ({ ...v, label: formatHexString(v.label) }))}
          // {...(showTag ? { tag: { label: getTagLabel(), variant: "info" } } : {})}
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
                    <span className="text-2xl text-neutral-800">{formatEther(balance ?? BigInt(0))}</span>
                    <span className="text-base text-neutral-500">{PUB_TOKEN_SYMBOL}</span>
                  </div>
                  <span className="text-sm text-neutral-500">Token balance</span>
                </div>
              </div>
            </div>
            <span>
              {/* TODO: Should be size 2xl */}
              <MemberAvatar address={address} size="lg" responsiveSize={{}} />
            </span>
          </div>
          <div>
            <span className="flex w-full flex-col gap-x-4 gap-y-3 md:flex-row">
              {hasDelegationProfile && (
                <Button
                  className="!rounded-full"
                  isLoading={isConfirming}
                  onClick={handleCtaClick}
                  disabled={connectedMemberIsSelfDelegated || !isConnected}
                >
                  {/* {getCtaLabel()} */}
                  TODO: CTA LABEL
                </Button>
              )}
              <Dropdown.Container
                customTrigger={
                  <Button className="!rounded-full" variant="tertiary" iconRight={IconType.CHEVRON_DOWN}>
                    {ensName ?? formattedAddress}
                  </Button>
                }
              >
                {ensName && (
                  <Dropdown.Item icon={IconType.COPY} iconPosition="right" onClick={() => clipboardUtils.copy(ensName)}>
                    {ensName}
                  </Dropdown.Item>
                )}
                <Dropdown.Item icon={IconType.COPY} iconPosition="right" onClick={() => clipboardUtils.copy(address)}>
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
