import {
  PUB_DELEGATION_CONTRACT_ADDRESS,
  PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  PUB_TOKEN_VOTING_PLUGIN_ADDRESS,
  PUB_LOCK_TO_VOTE_PLUGIN_ADDRESS,
  PUB_MULTISIG_PLUGIN_ADDRESS,
} from "@/constants";
import { IconType } from "@aragon/ods";

type PluginItem = {
  /** The URL fragment after /plugins */
  id: string;
  /** The name of the folder within `/plugins` */
  folderName: string;
  /** Title on menu */
  title: string;
  icon: IconType;
  pluginAddress: string;
};

export const plugins: PluginItem[] = [
  {
    id: "community-proposals",
    folderName: "dualGovernance",
    title: "Live Proposals",
    icon: IconType.APP_MEMBERS,
    pluginAddress: PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS,
  },
  {
    id: "core-proposals",
    folderName: "multisig",
    title: "Core Team Multisig",
    icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_MULTISIG_PLUGIN_ADDRESS,
  },
  {
    id: "emergency-proposals",
    folderName: "tokenVoting",
    title: "Emergency Multisig",
    icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_TOKEN_VOTING_PLUGIN_ADDRESS,
  },
  {
    id: "members",
    folderName: "delegateAnnouncer",
    title: "Taiko Delegates",
    icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_DELEGATION_CONTRACT_ADDRESS,
  },
];
