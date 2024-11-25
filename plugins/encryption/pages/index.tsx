import { MainSection } from "@/components/layout/main-section";
import { AlertCard, AlertVariant, Button, Heading, IAlertCardProps, Toggle, ToggleGroup } from "@aragon/ods";
import { useState } from "react";
import { AddressText } from "@/components/text/address";
import { Else, If, Then } from "@/components/if";
import { AccountList } from "../components/AccountList";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO, BYTES32_ZERO } from "@/utils/evm";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { AccountEncryptionStatus, useAccountEncryptionStatus } from "../hooks/useAccountEncryptionStatus";
import { AppointDialog } from "@/plugins/encryption/components/AppointDialog";
import { useEncryptionRegistry } from "../hooks/useEncryptionRegistry";
import { useDerivedWallet } from "@/hooks/useDerivedWallet";

export default function EncryptionPage() {
  const [toggleValue, setToggleValue] = useState<"ready" | "pending">("ready");
  const onToggleChange = (value: string | undefined) => {
    if (value) setToggleValue(value as "ready" | "pending");
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
              <Toggle value="ready" label="Ready" className="rounded-lg" />
              <Toggle value="pending" label="Pending" className="rounded-lg" />
            </ToggleGroup>
          </div>
          <AccountList listType={toggleValue} />
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
  let variant: AlertVariant = "warning";
  let title = "";
  let description = "";
  let actions: JSX.Element[] = [];
  const { address, isConnected } = useAccount();
  const { publicKey: derivedPublicKey } = useDerivedWallet();
  const { status, owner, appointedWallet, publicKey } = useAccountEncryptionStatus();
  const { registerPublicKey, isConfirming } = useEncryptionRegistry();
  const [showAppointModal, setShowAppointModal] = useState(false);

  if (!isConnected) {
    return <p>Connect your wallet to display the status</p>;
  } else if (status === AccountEncryptionStatus.LOADING_ENCRYPTION_STATUS) {
    return <PleaseWaitSpinner />;
  } else if (status === AccountEncryptionStatus.ERR_COULD_NOT_LOAD) {
    variant = "critical";
    title = "Error";
    description = "Could not load the account encryption status.";
  } else if (status === AccountEncryptionStatus.ERR_NOT_LISTED_OR_APPOINTED) {
    variant = "critical";
    title = "Not a member";
    description = "You are not listed as a signer or appointed by a signer.";
  } else if (status === AccountEncryptionStatus.ERR_SMART_WALLETS_CANNOT_REGISTER_PUB_KEY) {
    variant = "critical";
    title = "Error";
    description = "You are appointed by a listed signer but smart wallets cannot register public keys.";
  } else if (status === AccountEncryptionStatus.WARN_APPOINTED_MUST_REGISTER_PUB_KEY) {
    title = "Warning";
    description = "The wallet you appointed needs to define a public key.";
    actions = [
      <Button size="md" isLoading={isConfirming} variant="secondary" onClick={() => setShowAppointModal(true)}>
        Appoint a different wallet
      </Button>,
    ];
  } else if (status === AccountEncryptionStatus.CTA_APPOINTED_MUST_REGISTER_PUB_KEY) {
    title = "Warning";
    description = "You are appointed by a signer but you have not defined your public key yet.";
    actions = [
      <Button size="md" isLoading={isConfirming} onClick={() => registerPublicKey("appointed")}>
        Define public key
      </Button>,
    ];
  } else if (status === AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT) {
    title = "Warning";
    description =
      "You are listed as a signer but you have not appointed an Externally Owned Account for decryption yet.";
    actions = [
      <Button size="md" isLoading={isConfirming} onClick={() => setShowAppointModal(true)}>
        Appoint wallet
      </Button>,
    ];
  } else if (status === AccountEncryptionStatus.CTA_OWNER_MUST_APPOINT_OR_REGISTER_PUB_KEY) {
    title = "Warning";
    description = "You are listed as a signer but you have not defined your public key or appointed a wallet yet.";
    actions = [
      <Button size="md" isLoading={isConfirming} onClick={() => registerPublicKey("own")}>
        Define public key
      </Button>,
      <Button size="md" isLoading={isConfirming} variant="secondary" onClick={() => setShowAppointModal(true)}>
        Appoint wallet
      </Button>,
    ];
  }

  if (title && description) {
    // Show an error, warning or call to action
    return (
      <>
        <AlertCard message={title} description={description} variant={variant} />
        {actions}

        {/* Modal */}
        <AppointDialog open={showAppointModal} onClose={() => setShowAppointModal(false)} />
      </>
    );
  }

  if (status === AccountEncryptionStatus.READY_CAN_CREATE || status === AccountEncryptionStatus.READY_ALL) {
    if (derivedPublicKey !== publicKey) {
      actions.push(
        <Button size="md" isLoading={isConfirming} variant="secondary" onClick={() => registerPublicKey("own")}>
          Update public key
        </Button>
      );
    }

    if (owner === address) {
      actions.push(
        <Button size="md" isLoading={isConfirming} variant="secondary" onClick={() => setShowAppointModal(true)}>
          Appoint a wallet
        </Button>
      );
    }
  }

  // Show status
  return (
    <>
      <dl className="divide-y divide-neutral-100">
        <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
          <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
            Account owner
          </dt>
          <dd className="size-full text-base leading-tight text-neutral-500">
            <AddressText>{owner}</AddressText>
          </dd>
        </div>
        <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
          <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
            Appointed wallet
          </dt>
          <dd className="size-full text-base leading-tight text-neutral-500">
            <If condition={!appointedWallet || appointedWallet === ADDRESS_ZERO}>
              <Then>Acting by itself (no appointed wallet)</Then>
              <Else>
                <AddressText>{appointedWallet}</AddressText>
              </Else>
            </If>
          </dd>
        </div>
        <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
          <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
            Public key
          </dt>
          <dd className="size-full text-base leading-tight text-neutral-500">
            <If condition={!publicKey || publicKey === BYTES32_ZERO}>
              <Then>Not registered</Then>
              <Else>Registered</Else>
            </If>
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-y-3">{actions}</div>

      {/* Modal */}
      <AppointDialog open={showAppointModal} onClose={() => setShowAppointModal(false)} />
    </>
  );
}
