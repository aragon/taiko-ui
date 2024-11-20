import { MainSection } from "@/components/layout/main-section";
import { AlertCard, Button, Heading, Toggle, ToggleGroup } from "@aragon/ods";
import { useState } from "react";
import { AddressText } from "@/components/text/address";
import { Else, If, Then } from "@/components/if";
import { SignerList } from "../components/SignerList";
import { useEncryptionRegistryAccounts } from "../hooks/useEncryptionRegistryAccounts";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO, BYTES32_ZERO } from "@/utils/evm";
import { useIsContract } from "@/hooks/useIsContract";
import { PleaseWaitSpinner } from "@/components/please-wait";

export default function EncryptionPage() {
  const [toggleValue, setToggleValue] = useState<"active" | "pending" | "appointed">("active");
  const onToggleChange = (value: string | undefined) => {
    if (value) setToggleValue(value as "active" | "pending" | "appointed");
  };

  return (
    <MainSection>
      <div className="flex w-full max-w-[1280] flex-col gap-x-10 gap-y-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-start justify-between">
            <Heading size="h1">Encryption</Heading>

            <ToggleGroup
              isMultiSelect={false}
              onChange={onToggleChange}
              value={toggleValue}
              className="flex justify-end"
            >
              <Toggle value="active" label="Active" className="rounded-lg" />
              <Toggle value="appointed" label="Appointed" className="rounded-lg" />
              <Toggle value="pending" label="Pending" className="rounded-lg" />
            </ToggleGroup>
          </div>
          <SignerList />
        </div>
        <AsideSection />
      </div>
    </MainSection>
  );
}

function AsideSection() {
  return (
    <aside className="flex w-full flex-col gap-y-4 lg:max-w-[280px] lg:gap-y-6">
      <div className="flex flex-col gap-y-3">
        <Heading size="h3">Account status</Heading>
        <AccountStatus />
      </div>

      <div className="flex flex-col gap-y-3">
        <Heading size="h3">Details</Heading>
        <p className="text-neutral-500">
          Emergency proposals require that both their description and actions remain encrypted until executed.
        </p>
        <p className="text-neutral-500">
          Security council members can create emergency proposals but only externally owned addresses have the means to
          decrypt confidential data.
        </p>
        <p className="text-neutral-500">
          This section allows Security Council members holding an EOA to register their public key. For smart contract
          based accounts, it allows to appoint an EOA which can generate a public key to receive encrypted payloads.
        </p>
      </div>
    </aside>
  );
}

function AccountStatus() {
  const { address } = useAccount();
  const { data: accounts, isLoading: isLoading1 } = useEncryptionRegistryAccounts();
  const { isContract, isLoading: isLoading2 } = useIsContract(address);

  const account = accounts?.find((acc) => acc.owner === address || acc.appointedWallet === address);

  if (isLoading1 || isLoading2) {
    return <PleaseWaitSpinner />;
  } else if (!account) {
    let message = "You have not defined a public key or appointed an externally owned wallet";
    let actions: JSX.Element[] = [
      <Button size="md">Define public key</Button>,
      <Button size="md" variant="secondary">
        Appoint wallet
      </Button>,
    ];

    if (isContract) {
      message = "You have not appointed an externally owned wallet";
      actions = [
        <Button size="md" variant="secondary">
          Appoint wallet
        </Button>,
      ];
    }

    return (
      <>
        <AlertCard description={message} message="Not registered" variant="critical" />
        {actions}
      </>
    );
  } else if (!account.publicKey || account.publicKey === BYTES32_ZERO) {
    let message = "You have not defined a public key to access emergency proposals";
    let actions: JSX.Element[] = [
      <Button size="md">Define public key</Button>,
      <Button size="md" variant="secondary">
        Appoint wallet
      </Button>,
    ];

    return (
      <>
        <AlertCard description={message} message="Not registered" variant="critical" />
        {actions}
      </>
    );
  }

  return (
    <dl className="divide-y divide-neutral-100">
      <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
        <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
          Account owner
        </dt>
        <dd className="size-full text-base leading-tight text-neutral-500">
          <AddressText>{account?.owner}</AddressText>
        </dd>
      </div>
      <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
        <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
          Appointed wallet
        </dt>
        <dd className="size-full text-base leading-tight text-neutral-500">
          <If condition={account?.appointedWallet === ADDRESS_ZERO}>
            <Then>Acting by itself (no appointed wallet)</Then>
            <Else>
              <AddressText>{account?.appointedWallet}</AddressText>
            </Else>
          </If>
        </dd>
      </div>
      <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
        <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
          Public key
        </dt>
        <dd className="size-full text-base leading-tight text-neutral-500">
          <If condition={!account?.publicKey || account?.publicKey !== BYTES32_ZERO}>
            <Then>Not registered</Then>
            <Else>Registered</Else>
          </If>
        </dd>
      </div>
    </dl>
  );
}
