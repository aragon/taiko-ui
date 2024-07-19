import {
  PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
  PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  PUB_MULTISIG_PLUGIN_ADDRESS,
  PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
} from "@/constants";
import { IconType } from "@aragon/ods";

type PluginItem = {
  /** The URL fragment after /plugins */
  id: string;
  /** The name of the folder within `/plugins` */
  folderName: string;
  /** Title on menu */
  title: string;
  icon?: IconType;
  pluginAddress: string;
  hiddenIfNotSigner?: boolean;
};

export const plugins: PluginItem[] = [
  {
    id: "community-proposals",
    folderName: "optimistic-proposals",
    title: "Proposals",
    // icon: IconType.APP_MEMBERS,
    pluginAddress: PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  },
  {
    id: "multisig-proposals",
    folderName: "multisig",
    title: "Security Council Multisig",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_MULTISIG_PLUGIN_ADDRESS,
    hiddenIfNotSigner: true,
  },
  {
    id: "emergency-proposals",
    folderName: "emergency-multisig",
    title: "Emergency Multisig",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
    hiddenIfNotSigner: true,
  },
  {
    id: "members",
    folderName: "members",
    title: "Members",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
  },
];
