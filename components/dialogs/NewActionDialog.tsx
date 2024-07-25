import { RawAction } from "@/utils/types";
import { WithdrawalForm } from "@/components/input/withdrawal-form";
import { FunctionAbiSelectForm } from "@/components/input/function-abi-select-form";
import { Button, DialogContent, DialogFooter, DialogHeader, DialogRoot, type IDialogRootProps } from "@aragon/ods";
import { ElseIf, If, Then } from "@/components/if";
import { useState } from "react";
import { AbiFunction } from "viem";
import { CalldataForm } from "../input/calldata-form";

export type NewActionType = "" | "withdrawal" | "select-abi-function" | "calldata" | "custom-abi";

interface INewActionDialogProps extends IDialogRootProps {
  onClose: (newAction: RawAction | null, abi: AbiFunction | null) => void;
  newActionType: NewActionType;
}

export const NewActionDialog: React.FC<INewActionDialogProps> = (props) => {
  const { onClose, newActionType } = props;
  const [stagedAction, setStagedAction] = useState<RawAction | null>(null);
  const [abi, setAbi] = useState<AbiFunction | null>(null);

  const onReceiveAbiAction = (action: RawAction, newAbi: AbiFunction) => {
    setStagedAction(action);
    setAbi(newAbi);
  };
  const onActionCleared = () => {
    setStagedAction(null);
    setAbi(null);
  };
  const handleSubmit = () => {
    if (!stagedAction) return;

    onClose(stagedAction, abi || null);
    setStagedAction(null);
  };
  const dismiss = () => {
    onClose(null, null);
    setStagedAction(null);
  };

  const show = newActionType !== "";

  return (
    <DialogRoot open={show} containerClassName="!max-w-[420px]">
      <DialogHeader title="Add a new action" onCloseClick={() => dismiss()} onBackClick={() => dismiss()} />
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
        <If condition={newActionType === "withdrawal"}>
          <Then>
            <WithdrawalForm onChange={(action) => setStagedAction(action)} onSubmit={() => handleSubmit()} />
          </Then>
          <ElseIf condition={newActionType === "select-abi-function"}>
            <FunctionAbiSelectForm
              onChange={(action, abi) => onReceiveAbiAction(action, abi)}
              onActionCleared={onActionCleared}
            />
          </ElseIf>
          <ElseIf condition={newActionType === "custom-abi"}></ElseIf>
          <ElseIf condition={newActionType === "calldata"}>
            <CalldataForm onChange={(action) => setStagedAction(action)} onSubmit={() => handleSubmit()} />
          </ElseIf>
        </If>

        <div className="flex justify-between">
          <Button variant="secondary" size="lg" onClick={() => dismiss()}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!stagedAction} size="lg" onClick={() => handleSubmit()}>
            Add action
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
