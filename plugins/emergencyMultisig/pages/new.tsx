import React, { ReactNode, useEffect, useState } from "react";
import { Button, IconType, Icon, InputText, TextAreaRichText } from "@aragon/ods";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toHex } from "viem";
import { useAlerts } from "@/context/Alerts";
import WithdrawalInput from "@/components/input/withdrawal";
import { FunctionCallForm } from "@/components/input/function-call-form";
import { ProposalMetadata, RawAction } from "@/utils/types";
import { useRouter } from "next/router";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PleaseWaitSpinner } from "@/components/please-wait";
import {
  PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  PUB_CHAIN,
  PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
  PUB_APP_NAME,
  PUB_PROJECT_URL,
} from "@/constants";
import { ActionCard } from "@/components/actions/action";
import { uploadToPinata } from "@/utils/ipfs";
import { EmergencyMultisigPluginAbi } from "../artifacts/EmergencyMultisigPlugin";
import { usePublicKeyRegistry } from "../hooks/usePublicKeyRegistry";
import { useEncryptedData } from "../hooks/useEncryptedData";
import { MissingContentView } from "../components/MissingContentView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDerivedWallet } from "../hooks/useDerivedWallet";
import { MainSection } from "@/components/layout/main-section";

enum ActionType {
  Signaling,
  Withdrawal,
  Custom,
}

export default function Create() {
  const { push } = useRouter();
  const { address: selfAddress, isConnected } = useAccount();
  const { publicKey, requestSignature } = useDerivedWallet();
  const { open } = useWeb3Modal();
  const { addAlert } = useAlerts();
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [actions, setActions] = useState<RawAction[]>([]);
  const { writeContract: createProposalWrite, data: createTxHash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: createTxHash });
  const [actionType, setActionType] = useState<ActionType>(ActionType.Signaling);
  const {
    data: { addresses: registeredSigners },
    registerPublicKey,
    isLoading: pubKeysLoading,
  } = usePublicKeyRegistry();
  const { encryptProposalData } = useEncryptedData();

  const changeActionType = (actionType: ActionType) => {
    setActions([]);
    setActionType(actionType);
  };

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        console.error(error);
        addAlert("Could not create the proposal", { type: "error" });
      }
      return;
    }

    // success
    if (!createTxHash) return;
    else if (isConfirming) {
      addAlert("Proposal submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: createTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Proposal created", {
      description: "The transaction has been validated",
      type: "success",
      txHash: createTxHash,
    });
    setTimeout(() => push("#/"), 1000 * 2);
  }, [status, createTxHash, isConfirming, isConfirmed]);

  const submitProposal = async () => {
    // Check metadata
    if (!title.trim())
      return addAlert("Invalid proposal details", {
        description: "Please, enter a title",
        type: "error",
      });

    if (!summary.trim())
      return addAlert("Invalid proposal details", {
        description: "Please, enter a summary of what the proposal is about",
        type: "error",
      });

    // Check the action
    switch (actionType) {
      case ActionType.Signaling:
        break;
      case ActionType.Withdrawal:
        if (!actions.length) {
          return addAlert("Invalid proposal details", {
            description: "Please ensure that the withdrawal address and the amount to transfer are valid",
            type: "error",
          });
        }
        break;
      default:
        if (!actions.length || !actions[0].data || actions[0].data === "0x") {
          return addAlert("Invalid proposal details", {
            description: "Please ensure that the values of the action to execute are complete and correct",
            type: "error",
          });
        }
    }

    const privateMetadata: ProposalMetadata = {
      title,
      summary,
      description,
      resources: [{ name: PUB_APP_NAME, url: PUB_PROJECT_URL }],
    };

    // Encrypt the proposal data
    const { payload: publicMetadataJson, hashed } = await encryptProposalData(privateMetadata, actions);

    const publicMetadataUri = await uploadToPinata(JSON.stringify(publicMetadataJson));

    createProposalWrite({
      chainId: PUB_CHAIN.id,
      abi: EmergencyMultisigPluginAbi,
      address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
      functionName: "createProposal",
      args: [toHex(publicMetadataUri), hashed.metadataUri, hashed.actions, PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS, false],
    });
  };

  const handleTitleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };

  const handleSummaryInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event?.target?.value);
  };

  const showLoading = status === "pending" || isConfirming;

  return (
    <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
      <div className="w-full justify-between">
        <h1 className="mb-6 text-3xl font-semibold text-neutral-900">Create Proposal</h1>

        <If condition={pubKeysLoading}>
          <Then>
            {/* No public keys yet */}
            <div>
              <PleaseWaitSpinner fullMessage="Loading the signer public keys..." />
            </div>
          </Then>
          <ElseIf condition={!selfAddress || !isConnected}>
            {/* Not connected */}
            <MissingContentView
              message={`Please, connect your Ethereum wallet in order to continue.`}
              callToAction="Connect wallet"
              onClick={() => open()}
            />
          </ElseIf>
          <ElseIf condition={selfAddress && !registeredSigners.includes(selfAddress)}>
            {/* Public key not registered yet */}
            <MissingContentView
              message={`You haven't registered a public key yet. A public key is necessary in order for proposals to have
                  private data that only members can decrypt. You will sign a deterministic text, which will be used to
                  generate an encryption key only for this DAO.`}
              callToAction="Register your public key"
              onClick={() => registerPublicKey()}
            />
          </ElseIf>
          <ElseIf condition={!publicKey}>
            {/* Not signed in */}
            <MissingContentView
              message={`Please, sign in with your wallet in order to decrypt the private proposal data.`}
              callToAction="Sign in to continue"
              onClick={() => requestSignature()}
            />
          </ElseIf>
          <Else>
            {/* All ready */}
            {/* Form */}
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
            <div>
              <span className="text-md mb-2 block font-normal text-neutral-700 ">
                {registeredSigners.length} signer(s) registered a public key
              </span>
            </div>

            <If condition={showLoading}>
              <Then>
                <div className="mb-6 mt-14">
                  <PleaseWaitSpinner fullMessage="Confirming transaction..." />
                </div>
              </Then>
              <ElseIf condition={actionType !== ActionType.Custom}>
                <Button className="mb-6 mt-14" size="lg" variant="primary" onClick={() => submitProposal()}>
                  Submit proposal
                </Button>
              </ElseIf>
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
