import { useState } from "react";
import { AlertCard, CardEmptyState, DataList, IllustrationHuman } from "@aragon/ods";
import { SignerListItem } from "./AccountListItem";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { PUB_CHAIN } from "@/constants";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";
import { useEncryptionAccounts } from "../hooks/useEncryptionAccounts";

interface ISignerListProps {}

export const SignerList: React.FC<ISignerListProps> = () => {
  const [searchValue, setSearchValue] = useState<string>();
  const { signers } = useSignerList();
  const { data: accounts, isLoading, error } = useEncryptionAccounts();

  if (!accounts || (accounts.length === 0 && isLoading)) {
    return <PleaseWaitSpinner fullMessage="Please wait, loading accounts" />;
  } else if (!accounts.length) {
    if (error) return <NoSignersView title="Could not fetch" message={error?.message} />;
    return (
      <NoSignersView
        title="No signers registered"
        message="There are no signers registered on the Encryption Registry. Be the first one to register a public key or appoint an Externally Owned Wallet."
      />
    );
  }

  const activeAccounts = [];
  const pendingAccounts = [];

  for (const signer of signers) {
    if (accounts.some((acc) => acc.owner === signer)) {
      activeAccounts.push(signer);
    } else {
      pendingAccounts.push(signer);
    }
  }

  const showPagination = false;
  const signerCount = signers.length || 0;
  const registeredEncryptionAccounts = accounts.length;

  let entityLabel = <></>;
  if (registeredEncryptionAccounts === 0) {
    entityLabel = <>No signers are registered</>;
  } else if (registeredEncryptionAccounts < signerCount) {
    entityLabel = (
      <>
        Only {registeredEncryptionAccounts} of {signerCount} signers are registered for encrypted proposals
      </>
    );
  } else {
    entityLabel = <>{registeredEncryptionAccounts} signers are registered for encrypted proposals</>;
  }

  if (!registeredEncryptionAccounts) {
    return (
      <div>
        <AlertCard description={entityLabel} message="Encryption status" />
      </div>
    );
  }

  return (
    <DataList.Root entityLabel={"signer(s)"} itemsCount={registeredEncryptionAccounts}>
      <DataList.Filter onSearchValueChange={setSearchValue} searchValue={searchValue} placeholder="Filter by address" />
      <DataList.Container className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-5">
        {accounts.map((account) => (
          <SignerListItem
            key={account.owner}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${account.owner}`}
            target="_blank"
            {...account}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};

function NoSignersView({ message, title }: { message: string; title: string }) {
  return (
    <CardEmptyState
      description={message}
      heading={title}
      objectIllustration={{
        object: "LABELS",
      }}
    />
  );
}
