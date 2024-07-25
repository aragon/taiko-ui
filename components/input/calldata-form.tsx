import { type RawAction } from "@/utils/types";
import { type FC, useEffect, useState } from "react";
import { InputText, InputNumber, TextArea } from "@aragon/ods";
import { type Address, parseEther, isHex } from "viem";
import { isAddress } from "@/utils/evm";
import { If } from "../if";
import { PUB_CHAIN } from "@/constants";
import { useIsContract } from "@/hooks/useIsContract";
import { PleaseWaitSpinner } from "../please-wait";

interface ICalldataFormProps {
  onChange: (actions: RawAction) => any;
  onSubmit?: () => any;
}

export const CalldataForm: FC<ICalldataFormProps> = ({ onChange, onSubmit }) => {
  const coinName = PUB_CHAIN.nativeCurrency.symbol;
  const [to, setTo] = useState<Address>();
  const [calldata, setCalldata] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const { isContract, isLoading, error: isContractError } = useIsContract(to);

  useEffect(() => {
    if (!isAddress(to)) return;
    else if (!isHex(calldata) || calldata.trim().length % 2 !== 0) return;

    onChange({ to, value: BigInt(value || "0"), data: calldata } as unknown as RawAction);
  }, [to, calldata, value]);

  const handleTo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTo(event?.target?.value as Address);
  };

  return (
    <div className="my-6">
      <div className="mb-3 pb-3">
        <InputText
          label="Contract address"
          placeholder="0x1234..."
          variant={!to || isAddress(to) ? "default" : "critical"}
          value={to}
          alert={
            !!to && !isAddress(to)
              ? { message: "The address of the contract is not valid", variant: "critical" }
              : isLoading
                ? undefined
                : isContractError
                  ? { message: "Cannot check the given address", variant: "critical" }
                  : !!to && !isContract
                    ? { message: "The given address is not a contract", variant: "warning" }
                    : undefined
          }
          onChange={handleTo}
        />
        <If condition={isLoading}>
          <div className="py-2">
            <PleaseWaitSpinner />
          </div>
        </If>
      </div>
      <If condition={!!to && !isLoading}>
        <div className="pb-4">
          <TextArea
            className=""
            label="Calldata"
            placeholder="0x..."
            value={calldata}
            alert={
              !calldata || (isHex(calldata) && calldata.trim().length % 2 === 0)
                ? undefined
                : { message: "The given calldata is not valid", variant: "critical" }
            }
            onChange={(e) => setCalldata(e.target.value)}
          />
        </div>
        <div>
          <InputNumber
            label={`${coinName} amount (optional)`}
            placeholder="1.234"
            min={0}
            onChange={(val: string) => setValue(parseEther(val).toString())}
            onKeyDown={(e) => (e.key === "Enter" ? onSubmit?.() : null)}
          />
        </div>
      </If>
    </div>
  );
};
