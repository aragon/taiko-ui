import { useAccount, useReadContract } from "wagmi";
import { PUB_CHAIN, PUB_MULTISIG_PLUGIN_ADDRESS } from "@/constants";
import { MultisigPluginAbi } from "../artifacts/MultisigPlugin";

export function useCanCreateProposal() {
  const { address } = useAccount();

  const { data: isListed } = useReadContract({
    chainId: PUB_CHAIN.id,
    address: PUB_MULTISIG_PLUGIN_ADDRESS,
    abi: MultisigPluginAbi,
    functionName: "isListed",
    args: [address!],
  });

  return isListed;
}
