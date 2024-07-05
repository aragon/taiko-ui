import { PUB_CHAIN } from "@/constants";
import { formatHexString } from "@/utils/evm";
import { type IResource } from "@/utils/types";
import { Heading, IconType, Link } from "@aragon/ods";
import React from "react";
import { type Address } from "viem";
import { useEnsName } from "wagmi";

interface IProfileAsideProps {
  address: string;
  resources?: IResource[];
}

export const ProfileAside: React.FC<IProfileAsideProps> = (props) => {
  const { address, resources } = props;

  const { data: ensName } = useEnsName({ chainId: PUB_CHAIN.id, address: address as Address });

  const formattedAddress = formatHexString(address);

  const explorerUrl = `${PUB_CHAIN.blockExplorers?.default.url}/address/${address}`;
  const showResources = !!resources && resources.length > 0;

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <Heading size="h3">Details</Heading>
        <dl className="divide-y divide-neutral-100">
          <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
            <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
              Address
            </dt>
            <dd className="flex size-full justify-end text-base leading-tight text-neutral-500">
              <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                {formattedAddress}
              </Link>
            </dd>
          </div>
          {ensName && (
            <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Ens
              </dt>
              <dd className="flex size-full justify-end text-base leading-tight text-neutral-500">
                <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                  {ensName}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </div>
      {showResources && (
        <div className="flex flex-col gap-y-4">
          <Heading size="h3">Links</Heading>
          {resources.map(({ name, link }) => (
            <Link
              key={link}
              href={link}
              description={link}
              iconRight={IconType.LINK_EXTERNAL}
              target="_blank"
              rel="noopener"
            >
              {name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
