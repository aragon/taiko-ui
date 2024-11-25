import { useState } from "react";
import { CardEmptyState, DataList } from "@aragon/ods";
import { AccountListItemPending, AccountListItemReady } from "./AccountListItem";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { PUB_CHAIN } from "@/constants";
import { useSignerList } from "@/plugins/members/hooks/useSignerList";
import { useEncryptionAccounts } from "../hooks/useEncryptionAccounts";
import { Address } from "viem";
import { BYTES32_ZERO } from "@/utils/evm";

interface IAccountListProps {
  listType: "ready" | "pending";
}

export const AccountList: React.FC<IAccountListProps> = ({ listType }) => {
  const [searchValue, setSearchValue] = useState<string>();
  const { data: signers, isLoading: isLoading1 } = useSignerList();
  const { data: encryptionAccounts, isLoading: isLoading2, error } = useEncryptionAccounts();

  if (!encryptionAccounts?.length || !signers?.length || isLoading1 || isLoading2) {
    return <PleaseWaitSpinner fullMessage="Please wait, loading accounts" />;
  } else if (!encryptionAccounts.length) {
    if (error) return <NoSignersView title="Could not fetch" message={error?.message} />;
    return (
      <NoSignersView
        title="No signers registered"
        message="There are no signers registered on the Encryption Registry. Be the first one to register a public key or appoint an Externally Owned Wallet."
      />
    );
  }

  // At least one encryption account is registered

  const accounts: Address[] = [];

  if (listType === "ready") {
    for (const signer of signers || []) {
      const acc = encryptionAccounts.find((acc) => acc.owner === signer);
      if (!acc || !acc.publicKey || acc.publicKey === BYTES32_ZERO) continue;

      accounts.push(signer);
    }
  } else {
    // pending
    for (const signer of signers) {
      const acc = encryptionAccounts.find((acc) => acc.owner === signer);
      if (!acc || !acc.publicKey || acc.publicKey === BYTES32_ZERO) accounts.push(signer);
    }
  }

  if (!accounts?.length) {
    if (listType === "ready") {
      return (
        <NoSignersView
          title="No active encryption accounts"
          message="There are no active accounts fully set up on the Encryption Registry. Be the first one to register a public key or appoint an Externally Owned Account."
        />
      );
    } else {
      return (
        <NoSignersView
          title="All encryption accounts are ready"
          message="No Security Council accounts appear to need additional steps"
        />
      );
    }
  }

  return (
    <DataList.Root
      entityLabel={listType === "ready" ? "account(s) set up" : "pending account(s)"}
      itemsCount={accounts.length}
    >
      <DataList.Filter onSearchValueChange={setSearchValue} searchValue={searchValue} placeholder="Filter by address" />
      <DataList.Container className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-5">
        {accounts
          .filter((acc) => !searchValue || acc.toLowerCase().includes(searchValue.toLowerCase()))
          .map((account) => {
            const eAcc = encryptionAccounts.find((a) => a.owner === account);

            if (listType === "ready") {
              return (
                <AccountListItemReady
                  key={account}
                  href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${account}`}
                  target="_blank"
                  owner={account}
                  appointedWallet={eAcc?.appointedWallet}
                  publicKey={eAcc?.publicKey}
                />
              );
            }

            // pending
            return (
              <AccountListItemPending
                key={account}
                href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${account}`}
                target="_blank"
                owner={account}
                appointedWallet={eAcc?.appointedWallet}
                publicKey={eAcc?.publicKey}
              />
            );
          })}
      </DataList.Container>
      {/* <DataList.Pagination /> */}
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
