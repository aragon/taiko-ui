import { useEffect, useState } from "react";
import { type Hex, encodeFunctionData } from "viem";
import { AlertInline, InputText } from "@aragon/ods";
import { type AbiFunction } from "abitype";
import { If } from "@/components/if";
import { InputParameter } from "./input-parameter";
import { type InputValue } from "@/utils/input-values";
import { logger } from "@/services/logger";

interface IFunctionParamsFormProps {
  functionAbi?: AbiFunction;
  onActionChanged: (calldata: Hex, value: bigint, abi: AbiFunction) => void;
  onActionCleared: () => any;
}
export const FunctionParamsForm = ({ functionAbi, onActionChanged, onActionCleared }: IFunctionParamsFormProps) => {
  const [inputValues, setInputValues] = useState<InputValue[]>([]);
  const [value, setValue] = useState<string>("");

  const canSend = (() => {
    if (!functionAbi) return false;

    for (let i = 0; i < functionAbi.inputs.length; i++) {
      if (inputValues[i] === null || inputValues[i] === undefined) {
        return false;
      }
    }
    return true;
  })();

  useEffect(() => {
    // Clean up if another function is selected
    setInputValues([]);
  }, [functionAbi]);

  useEffect(() => {
    // Attempt to sync when possible
    trySubmit();
  }, [functionAbi, inputValues.join(","), canSend]);

  const onParameterChange = (paramIdx: number, value: InputValue) => {
    const newInputValues = [...inputValues];
    newInputValues[paramIdx] = value;
    setInputValues(newInputValues);
  };

  const trySubmit = () => {
    if (!functionAbi || !canSend) {
      onActionCleared();
      return;
    }

    try {
      const data = encodeFunctionData({
        abi: [functionAbi],
        functionName: functionAbi.name,
        args: inputValues,
      });
      onActionChanged(data, BigInt(value ?? "0"), functionAbi);
    } catch (err) {
      logger.error("Invalid parameters", err);
      onActionCleared();
    }
  };

  return (
    <div className="w-full overflow-y-auto rounded-r-lg pt-4">
      <If condition={functionAbi?.inputs.length}>
        <div className="flex flex-row items-center justify-between border-b border-neutral-200 pb-4">
          <p className="text-md font-semibold text-neutral-800">Parameters</p>
        </div>
      </If>
      <If condition={["pure", "view"].includes(functionAbi?.stateMutability ?? "")}>
        <div className="">
          <AlertInline
            message="This function is marked as read only. An action sent to it will have no impact"
            variant="warning"
          />
        </div>
      </If>
      {functionAbi?.inputs.map((paramAbi, i) => (
        <div key={i} className=" my-3">
          <InputParameter abi={paramAbi} idx={i} onChange={onParameterChange} />
        </div>
      ))}
      <If condition={functionAbi?.stateMutability === "payable" || !!functionAbi?.payable}>
        <div className="my-4">
          <InputText
            className=""
            label="Value (in wei)"
            placeholder="1000000000000000000"
            variant={value.match(/^[0-9]*$/) ? "default" : "critical"}
            value={value}
            onChange={(e) => setValue(e.target.value || "")}
          />
        </div>
      </If>
    </div>
  );
};
