import { type RawAction } from "@/utils/types";
import { type FC, useEffect, useState } from "react";
import { TextArea, AlertInline } from "@aragon/ods";
import { type Address, isHex, AbiFunction, fromHex } from "viem";
import { If, Then } from "../if";

interface IImportActionsFormProps {
  onChange: (actions: RawAction[]) => any;
}

export const ImportActionsForm: FC<IImportActionsFormProps> = ({ onChange }) => {
  const [actions, setActions] = useState<RawAction[]>([]);
  const [strJson, setStrJson] = useState("");

  const onJsonData = (strJson: string) => {
    try {
      setStrJson(strJson);

      const actions = decodeStrJson(strJson);
      setActions(actions);
      onChange(actions);
    } catch (_) {
      //
      setActions([]);
      onChange([]);
    }
  };

  return (
    <div className="my-6">
      <div className="pb-4">
        <TextArea
          className=""
          label="JSON actions"
          placeholder="Copy the contents of the JSON file here"
          alert={resolveCalldataAlert(strJson)}
          onChange={(e) => onJsonData(e.target.value)}
        />
      </div>

      {/* Try to decode */}
      <If condition={!!actions?.length}>
        <div className="flex flex-row items-center justify-between pt-4">
          <p className="text-md text-neutral-800">{actions?.length || 0} action(s) can ben imported</p>
        </div>
      </If>
    </div>
  );
};

// Helpers

function resolveCalldataAlert(strJson: string): { message: string; variant: "critical" | "warning" } | undefined {
  if (!strJson) return undefined;

  try {
    decodeStrJson(strJson);
    return undefined;
  } catch (_) {
    return { message: "The given JSON data contains invalid entries", variant: "critical" };
  }
}

function decodeStrJson(strJson: string): RawAction[] {
  const actions = JSON.parse(strJson);
  if (!Array.isArray(actions)) throw new Error("Invalid body");

  const result: RawAction[] = [];
  for (const action of actions) {
    if (typeof action !== "object") throw new Error("Invalid item");
    else if (!isHex(action.to)) throw new Error("Invalid to");
    else if (action.data && !isHex(action.data)) throw new Error("Invalid data");
    else if (!!action.value && !isHex(action.value)) throw new Error("Invalid value");

    result.push({
      to: action.to,
      data: action.data,
      value: fromHex(action.value || "0x0", "bigint"),
    });
  }
  return result;
}
