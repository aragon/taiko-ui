import { Button, IconType, Icon, InputText, TextAreaRichText } from "@aragon/ods";
import React from "react";
import WithdrawalInput from "@/components/input/withdrawal";
import { FunctionCallForm } from "@/components/input/function-call-form";
import { ActionType } from "@/utils/types";
import { Else, ElseIf, If, Then } from "@/components/if";
import { ActionCard } from "@/components/actions/action";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { MissingContentView } from "@/components/MissingContentView";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function Create() {
  const { open } = useWeb3Modal();
  const { address: selfAddress, isConnected } = useAccount();
  const canCreate = useCanCreateProposal();
  const {
    title,
    summary,
    description,
    actions,
    actionType,
    setTitle,
    setSummary,
    setDescription,
    setActions,
    setActionType,
    isCreating,
    submitProposal,
  } = useCreateProposal();

  const changeActionType = (actionType: ActionType) => {
    setActions([]);
    setActionType(actionType);
  };
  const handleTitleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };
  const handleSummaryInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event?.target?.value);
  };

  return (
    <MainSection narrow>
      <div className="w-full justify-between py-5">
        <h1 className="mb-10 text-3xl font-semibold text-neutral-900">Create Proposal</h1>

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
          <Else>
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
            <div className="mb-6">
              <span className="mb-2 block text-lg font-normal text-neutral-900 ">Select the type of proposal</span>
              <div className="mt-2 grid h-24 grid-cols-3 gap-5">
                <div
                  onClick={() => {
                    changeActionType(ActionType.Signaling);
                  }}
                  className={`flex cursor-pointer flex-col items-center rounded-xl border border-2 border-solid bg-neutral-0 hover:bg-neutral-50 ${
                    actionType === ActionType.Signaling ? "border-primary-300" : "border-neutral-100"
                  }`}
                >
                  <Icon
                    className={
                      "mt-2 !h-12 !w-10 p-2 " +
                      (actionType === ActionType.Signaling ? "text-primary-400" : "text-neutral-400")
                    }
                    icon={IconType.INFO}
                    size="lg"
                  />
                  <span className="text-center text-sm text-neutral-400">Signaling</span>
                </div>
                <div
                  onClick={() => changeActionType(ActionType.Withdrawal)}
                  className={`flex cursor-pointer flex-col items-center rounded-xl border border-2 border-solid bg-neutral-0 hover:bg-neutral-50 ${
                    actionType === ActionType.Withdrawal ? "border-primary-300" : "border-neutral-100"
                  }`}
                >
                  <Icon
                    className={
                      "mt-2 !h-12 !w-10 p-2 " +
                      (actionType === ActionType.Withdrawal ? "text-primary-400" : "text-neutral-400")
                    }
                    icon={IconType.WITHDRAW}
                    size="lg"
                  />
                  <span className="text-center text-sm text-neutral-400">DAO Payment</span>
                </div>
                <div
                  onClick={() => changeActionType(ActionType.Custom)}
                  className={`flex cursor-pointer flex-col items-center rounded-xl border border-2 border-solid bg-neutral-0 hover:bg-neutral-50 ${
                    actionType === ActionType.Custom ? "border-primary-300" : "border-neutral-100"
                  }`}
                >
                  <Icon
                    className={
                      "mt-2 !h-12 !w-10 p-2 " +
                      (actionType === ActionType.Custom ? "text-primary-400" : "text-neutral-400")
                    }
                    icon={IconType.BLOCKCHAIN_BLOCKCHAIN}
                    size="lg"
                  />
                  <span className="text-center text-sm text-neutral-400">Custom action</span>
                </div>
              </div>
              <div className="mb-6">
                {actionType === ActionType.Withdrawal && <WithdrawalInput setActions={setActions} />}
                {actionType === ActionType.Custom && (
                  <FunctionCallForm onAddAction={(action) => setActions(actions.concat([action]))} />
                )}
              </div>
            </div>

            <If condition={actionType !== ActionType.Custom}>
              <Then>
                <Button
                  isLoading={isCreating}
                  className="mb-6 mt-14"
                  size="lg"
                  variant="primary"
                  onClick={() => submitProposal()}
                >
                  Submit proposal
                </Button>
              </Then>
              <Else>
                <div className="mb-6 mt-14">
                  <If not={actions.length}>
                    <Then>
                      <p>Add the first action to continue</p>
                    </Then>
                    <Else>
                      <p className="flex-grow pb-3 text-lg font-semibold text-neutral-900">Actions</p>
                      <div className="mb-10">
                        {actions?.map?.((action, i) => (
                          <div className="mb-3" key={`${i}-${action.to}-${action.data}`}>
                            <ActionCard action={action} idx={i} />
                          </div>
                        ))}
                      </div>
                    </Else>
                  </If>
                  <Button
                    className="mt-3"
                    size="lg"
                    variant="primary"
                    disabled={!actions.length}
                    onClick={() => submitProposal()}
                  >
                    Submit proposal
                  </Button>
                </div>
              </Else>
            </If>
          </Else>
        </If>
      </div>
    </MainSection>
  );
}
