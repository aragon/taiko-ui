import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  IInputContainerAlert,
  type IDialogRootProps,
} from "@aragon/ods";
import { useState } from "react";
import { Address } from "viem";
import { AddressInput } from "@aragon/ods";
import { BYTES32_ZERO, isAddress } from "@/utils/evm";
import { useEncryptionRegistry } from "@/plugins/encryption/hooks/useEncryptionRegistry";
import { useIsContract } from "@/hooks/useIsContract";
import { Else, ElseIf, If, Then } from "@/components/if";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { useAccountEncryptionStatus } from "../hooks/useAccountEncryptionStatus";

interface IAppointDialogProps extends IDialogRootProps {
  open?: boolean;
  onClose: () => void;
}

export const AppointDialog: React.FC<IAppointDialogProps> = (props) => {
  const { onClose, open } = props;
  const [address, setAddress] = useState<Address>();
  const { isContract, isLoading: isLoadingIsContract } = useIsContract(address);
  const { appointWallet, isConfirming } = useEncryptionRegistry({
    onAppointSuccess: () => onClose(),
  });
  const { publicKey } = useAccountEncryptionStatus();

  const validAddress = isAddress(address);

  let addressAlert: IInputContainerAlert | undefined;
  if (!isLoadingIsContract) {
    if (address && !validAddress) {
      addressAlert = { message: "The address is not valid", variant: "critical" };
    } else if (isContract) {
      addressAlert = { message: "The address cannot be a smart contract", variant: "critical" };
    }
  }

  return (
    <DialogRoot open={open} containerClassName="!max-w-[420px]">
      <DialogHeader title="Appoint a wallet" onCloseClick={() => onClose()} onBackClick={() => onClose()} />
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
        <div className="my-6">
          <div className="pb-4">
            <AddressInput
              value={address}
              label="Address of the wallet to appoint"
              alert={addressAlert}
              placeholder="0x..."
              onChange={(addr: any) => setAddress(addr)}
            />
          </div>
          <If condition={isLoadingIsContract}>
            <p className="pb-2">
              <PleaseWaitSpinner fullMessage="Checking address" />
            </p>
          </If>
          <If condition={!!publicKey && publicKey !== BYTES32_ZERO}>
            <p className="pb-2 text-sm text-neutral-400">
              You currently have a public key defined. By appointing an address, the public key will be reset and the
              appointed wallet will need to register the new one.
            </p>
          </If>
          <p className="pb-2 text-sm text-neutral-400">
            <If condition={address !== "0x0000000000000000000000000000000000000000"}>
              <Then>
                If you wish to undo an appointment,{" "}
                <a
                  className="cursor-pointer underline"
                  onClick={() => setAddress("0x0000000000000000000000000000000000000000")}
                >
                  click here to wipe the currently appointed address
                </a>
                .
              </Then>
              <Else>
                Setting an empty address will undo the existing appointment and restore your address as the account's
                agent.
              </Else>
            </If>
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" size="lg" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            isLoading={isConfirming}
            disabled={!validAddress || isContract}
            onClick={() => appointWallet(address!)}
          >
            Appoint address
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
