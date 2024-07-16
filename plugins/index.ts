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
  hidden?: boolean;
};

export const plugins: PluginItem[] = [
  {
    id: "community-vote",
    folderName: "dualGovernance",
    title: "Community Vote",
    // icon: IconType.APP_MEMBERS,
    pluginAddress: PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  },
  {
    id: "core-proposals",
    folderName: "multisig",
    title: "Core Team Multisig",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_MULTISIG_PLUGIN_ADDRESS,
    hidden: true,
  },
  {
    id: "emergency-proposals",
    folderName: "emergencyMultisig",
    title: "Emergency Multisig",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS,
    hidden: true,
  },
  {
    id: "members",
    folderName: "delegateAnnouncer",
    title: "DAO Members",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_DELEGATION_WALL_CONTRACT_ADDRESS,
  },
];
