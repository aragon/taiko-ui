import { type RawAction } from "@/utils/types";
import { type FC, useEffect, useState } from "react";
import { InputText, InputNumber, AlertInline } from "@aragon/ods";
import { type Address, parseEther } from "viem";
import { isAddress } from "@/utils/evm";
import { ElseIf, If, Then } from "../if";
import { PUB_CHAIN } from "@/constants";

interface WithdrawalInputProps {
  onChange: (actions: RawAction) => any;
  onSubmit?: () => any;
}

const WithdrawalInput: FC<WithdrawalInputProps> = ({ onChange, onSubmit }) => {
  const coinName = PUB_CHAIN.nativeCurrency.symbol;
  const [to, setTo] = useState<Address>();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!isAddress(to)) return;
    else if (!isNumeric(value)) return;

    onChange({ to, value: BigInt(value), data: "" } as unknown as RawAction);
  }, [to, value]);

  const handleTo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTo(event?.target?.value as Address);
  };

  return (
    <div className="my-6">
      <div className="mb-3 pb-3">
        <InputText
          label="Recipient address"
          placeholder="0x1234..."
          variant={!to || isAddress(to) ? "default" : "critical"}
          value={to}
          onChange={handleTo}
        />
        <If not={to}>
          <Then>
            <p className="mt-3">Enter the address to transfer {coinName} to</p>
          </Then>
          <ElseIf not={isAddress(to)}>
            <AlertInline className="mt-3" message="The address of the contract is not valid" variant="critical" />
          </ElseIf>
        </If>
      </div>
      <div>
        <InputNumber
          label={`${coinName} amount`}
          placeholder="1.234"
          min={0}
          variant={!value || isNumeric(value) ? "default" : "critical"}
          onChange={(val: string) => setValue(parseEther(val).toString())}
          onKeyDown={(e) => (e.key == "enter" ? onSubmit?.() : null)}
        />
      </div>
    </div>
  );
};

function isNumeric(value: string): boolean {
  if (!value) return false;
  return !!value.match(/^[0-9]+$/);
}

export default WithdrawalInput;
