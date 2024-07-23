import React, { ReactNode, useState } from "react";
import { Button, IconType, InputText, TextAreaRichText } from "@aragon/ods";
import { useAccount } from "wagmi";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { MissingContentView } from "@/components/MissingContentView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDerivedWallet } from "../../../hooks/useDerivedWallet";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { usePublicKeyRegistry } from "../hooks/usePublicKeyRegistry";
import { useMultisigMembers } from "@/plugins/members/hooks/useMultisigMembers";
import { RawAction } from "@/utils/types";
import { NewActionDialog, NewActionType } from "@/components/dialogs/NewActionDialog";
import { Address } from "viem";
import { AddActionCard } from "@/components/cards/AddActionCard";
import { ProposalActions } from "@/components/proposalActions/proposalActions";

export default function Create() {
  const { address: selfAddress, isConnected } = useAccount();
  const canCreate = useCanCreateProposal();
  const [addActionType, setAddActionType] = useState<NewActionType>("");
  const { data: registeredSigners } = usePublicKeyRegistry();
  const {
    title,
    summary,
    description,
    actions,
    setTitle,
    setSummary,
    setDescription,
    setActions,
    isCreating,
    submitProposal,
  } = useCreateProposal();
  const { members: multisigMembers } = useMultisigMembers();

  const handleTitleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };
  const handleSummaryInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event?.target?.value);
  };
  const handleNewActionDialogClose = (newAction: RawAction | null) => {
    if (!newAction) {
      setAddActionType("");
      return;
    }

    setActions(actions.concat(newAction));
    setAddActionType("");
  };

  const filteredSignerItems = registeredSigners.filter((signer) => {
    return multisigMembers.includes(signer.address);
  });
  const signersWithPubKey = filteredSignerItems.length;

  return (
    <MainSection narrow>
      <div className="w-full justify-between">
        <h1 className="mb-10 text-3xl font-semibold text-neutral-900">Create Proposal</h1>

        <PlaceHolderOr selfAddress={selfAddress} canCreate={canCreate} isConnected={isConnected}>
          <div className="mb-6">
            <InputText
              className=""
              label="Title"
              maxLength={100}
              placeholder="A short title that describes the main purpose"
              variant="default"
              value={title}
              onChange={handleTitleInput}
            />
          </div>
          <div className="mb-6">
            <InputText
              className=""
              label="Summary"
              maxLength={280}
              placeholder="A short summary that outlines the main purpose of the proposal"
              variant="default"
              value={summary}
              onChange={handleSummaryInput}
            />
          </div>
          <div className="mb-6">
            <TextAreaRichText
              label="Description"
              className="pt-2"
              value={description}
              onChange={setDescription}
              placeholder="A description for what the proposal is all about"
            />
          </div>

          {/* Actions */}

          <ProposalActions
            actions={actions}
            emptyListDescription="The proposal has no actions defined yet. Select a type of action to add to the proposal."
          />

          <div className="mt-8 grid w-full grid-cols-2 gap-4 md:grid-cols-4">
            <AddActionCard
              title="Add a payment"
              icon={IconType.WITHDRAW}
              onClick={() => setAddActionType("withdrawal")}
            />
            <AddActionCard
              title="Select a function"
              icon={IconType.BLOCKCHAIN_BLOCKCHAIN}
              onClick={() => setAddActionType("select-abi-function")}
            />
            <AddActionCard
              title="Enter the function ABI"
              disabled
              icon={IconType.RICHTEXT_LIST_UNORDERED}
              onClick={() => setAddActionType("custom-abi")}
            />
            <AddActionCard
              title="Copy the calldata"
              disabled
              icon={IconType.COPY}
              onClick={() => setAddActionType("calldata")}
            />
          </div>

          {/* Dialog */}

          <NewActionDialog
            newActionType={addActionType}
            onClose={(newAction) => handleNewActionDialogClose(newAction)}
          />

          {/* Submit */}

          <div className="mt-6 flex w-full flex-col items-center">
            <div>
              <span className="text-md mb-2 block font-normal text-neutral-700 ">
                {signersWithPubKey || 0} signer(s) registered the public key
              </span>
            </div>
            <Button
              isLoading={isCreating}
              className="mt-3 border-primary-400"
              size="lg"
              variant={actions.length ? "primary" : "secondary"}
              onClick={() => submitProposal()}
            >
              <If condition={actions.length}>
                <Then>Submit proposal</Then>
                <Else>Submit signaling proposal</Else>
              </If>
            </Button>
          </div>
        </PlaceHolderOr>
      </div>
    </MainSection>
  );
}

// HELPERS

const PlaceHolderOr = ({
  selfAddress,
  isConnected,
  canCreate,
  children,
}: {
  selfAddress: Address | undefined;
  isConnected: boolean;
  canCreate: boolean | undefined;
  children: ReactNode;
}) => {
  const { open } = useWeb3Modal();
  const { publicKey, requestSignature } = useDerivedWallet();
  const {
    data: registeredSigners,
    registerPublicKey,
    isLoading: isLoadingPubKeys,
    isConfirming: isRegisteringPublicKey,
  } = usePublicKeyRegistry();
  const hasPubKeyRegistered = registeredSigners.some((item) => item.address === selfAddress);

  return (
    <If condition={isLoadingPubKeys}>
      <Then>
        {/* No public keys yet */}
        <div>
          <PleaseWaitSpinner fullMessage="Loading the signer public keys..." />
        </div>
      </Then>
      <ElseIf condition={!selfAddress || !isConnected}>
        {/* Not connected */}
        <MissingContentView callToAction="Connect wallet" onClick={() => open()}>
          Please, connect your Ethereum wallet to continue.
        </MissingContentView>
      </ElseIf>
      <ElseIf condition={selfAddress && !hasPubKeyRegistered}>
        {/* Public key not registered yet */}
        <MissingContentView
          callToAction="Register your public key"
          onClick={() => registerPublicKey()}
          isLoading={isRegisteringPublicKey}
        >
          You haven&apos;t registered a public key yet. A public key is necessary in order for proposals to have private
          data that only members can decrypt. You will sign a deterministic text, which will be used to generate an
          encryption key only for this DAO.
        </MissingContentView>
      </ElseIf>
      <ElseIf condition={!publicKey}>
        {/* Not signed in */}
        <MissingContentView callToAction="Sign in to continue" onClick={() => requestSignature()}>
          Please, sign in with your Ethereum wallet to decrypt the private proposal data.
        </MissingContentView>
      </ElseIf>
      <ElseIf condition={!canCreate}>
        {/* Not a member */}
        <MissingContentView>
          You cannot create proposals on the multisig because you are not currently defined as a member.
        </MissingContentView>
      </ElseIf>
      <Else>{children}</Else>
    </If>
  );
};