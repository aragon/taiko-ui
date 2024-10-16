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
import { isAddress } from "@/utils/evm";
import { useEncryptionRegistry } from "@/plugins/emergency-multisig/hooks/useEncryptionRegistry";

interface IAppointDialogProps extends IDialogRootProps {
  onClose: () => void;
}

export const AppointDialog: React.FC<IAppointDialogProps> = (props) => {
  const { onClose } = props;
  const [address, setAddress] = useState<Address>();
  const { appointWallet, isConfirming } = useEncryptionRegistry({
    onAppointSuccess: () => onClose(),
  });

  let addressAlert: IInputContainerAlert | undefined;

  return (
    <DialogRoot containerClassName="!max-w-[420px]">
      <DialogHeader title="Appoint a wallet" onCloseClick={() => onClose()} onBackClick={() => onClose()} />
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
        <div className="my-6">
          <div className="pb-4">
            <AddressInput label="Appointed address" alert={addressAlert} onChange={(addr: any) => setAddress(addr)} />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" size="lg" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            isLoading={isConfirming}
            disabled={!isAddress(address)}
            onClick={() => isAddress(address) && appointWallet(address!)}
          >
            Appoint address
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
