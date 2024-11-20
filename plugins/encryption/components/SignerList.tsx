import { useState } from "react";
import { AlertCard, CardEmptyState, DataList, IllustrationHuman } from "@aragon/ods";
import { SignerListItem } from "./SignerListItem";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { PUB_CHAIN } from "@/constants";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";
import { useEncryptionRegistryAccounts } from "../hooks/useEncryptionRegistryAccounts";

interface ISignerListProps {}

export const SignerList: React.FC<ISignerListProps> = () => {
  const [searchValue, setSearchValue] = useState<string>();
  const { signers } = useSignerList();
  const { data: accounts, isLoading, error } = useEncryptionRegistryAccounts();

  if (!accounts || (accounts.length === 0 && isLoading)) {
    return <PleaseWaitSpinner fullMessage="Please wait, loading accounts" />;
  } else if (!accounts.length) {
    return <NoMembersView error={error?.message} />;
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
    <DataList.Root entityLabel={registeredEncryptionAccounts + " signer(s)"} itemsCount={registeredEncryptionAccounts}>
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

function NoMembersView({ error }: { error?: string }) {
  let message: string;
  if (error?.length) {
    message = error;
  } else {
    message =
      "The list of encryption ready signers is empty. This means that the signers list is empty or that none of them has registered a public key or appointed a wallet.";
  }

  return (
    <CardEmptyState
      description={message}
      heading="No signers available"
      objectIllustration={{
        object: "LABELS",
      }}
    />
  );
}
