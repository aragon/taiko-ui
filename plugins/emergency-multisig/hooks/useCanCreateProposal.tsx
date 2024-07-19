import { useAccount, useReadContract } from "wagmi";
import { PUB_CHAIN, PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { EmergencyMultisigPluginAbi } from "../artifacts/EmergencyMultisigPlugin";

export function useCanCreateProposal() {
  const { address } = useAccount();

  const { data: isListed } = useReadContract({
    chainId: PUB_CHAIN.id,
    address: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
    abi: EmergencyMultisigPluginAbi,
    functionName: "isMember",
    args: [address!],
  });

  return isListed;
}
