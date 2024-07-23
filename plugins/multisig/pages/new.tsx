import { Button, IconType, Icon, InputText, TextAreaRichText, IllustrationHuman } from "@aragon/ods";
import React, { ReactNode, useState } from "react";
import { RawAction } from "@/utils/types";
import { Else, ElseIf, If, Then } from "@/components/if";
import { ActionCard } from "@/components/actions/action";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { MissingContentView } from "@/components/MissingContentView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Address } from "viem";
import { NewActionDialog, NewActionType } from "@/components/dialogs/NewActionDialog";
import { AddActionCard } from "@/components/cards/AddActionCard";

export default function Create() {
  const { address: selfAddress, isConnected } = useAccount();
  const canCreate = useCanCreateProposal();
  const [addActionType, setAddActionType] = useState<NewActionType>("");
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

          <label className="flex flex-col gap-0.5 pb-3 md:gap-1">
            <div className="flex flex-row items-center gap-3">
              <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">Actions</p>
            </div>
          </label>

          {actions.map((action, idx) => (
            <div className="mb-4" key={`${idx}-${action.to}-${action.data}`}>
              <ActionCard action={action} idx={idx} />
            </div>
          ))}

          <If condition={!actions.length}>
            <div className="-mb-4 flex flex-col gap-4 rounded-xl border border-solid border-neutral-100 bg-neutral-0 p-4">
              <div className="w-full">
                <p className="text-md text-neutral-400">
                  The proposal has no actions defined yet. Add the first one to turn a signaling proposal into a binding
                  execution proposal.
                </p>
              </div>
            </div>
          </If>

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
              title="Use a custom ABI"
              disabled
              icon={IconType.INFO}
              onClick={() => setAddActionType("custom-abi")}
            />
            <AddActionCard
              title="Enter the calldata"
              disabled
              icon={IconType.DOTS_HORIZONTAL}
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
  return (
    <If condition={!selfAddress || !isConnected}>
      <Then>
        {/* Not connected */}
        <MissingContentView callToAction="Connect wallet" onClick={() => open()}>
          Please, connect your Ethereum wallet to continue.
        </MissingContentView>
      </Then>
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
