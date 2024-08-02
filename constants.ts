import { Address } from "viem";
import { ChainName, getChain } from "./utils/chains";

// Contract Addresses
export const PUB_DAO_ADDRESS = (process.env.NEXT_PUBLIC_DAO_ADDRESS ?? "") as Address;
export const PUB_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as Address;

export const PUB_MULTISIG_PLUGIN_ADDRESS = (process.env.NEXT_PUBLIC_MULTISIG_PLUGIN_ADDRESS ?? "") as Address;
export const PUB_EMERGENCY_MULTISIG_PLUGIN_ADDRESS = (process.env.NEXT_PUBLIC_EMERGENCY_MULTISIG_PLUGIN_ADDRESS ??
  "") as Address;
export const PUB_DUAL_GOVERNANCE_PLUGIN_ADDRESS = (process.env.NEXT_PUBLIC_DUAL_GOVERNANCE_PLUGIN_ADDRESS ??
  "") as Address;
export const PUB_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PUBLIC_KEY_REGISTRY_CONTRACT_ADDRESS ??
  "") as Address;
export const PUB_DELEGATION_WALL_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_DELEGATION_WALL_CONTRACT_ADDRESS ??
  "") as Address;

export const PUB_TAIKO_BRIDGE_ADDRESS = (process.env.NEXT_PUBLIC_TAIKO_BRIDGE_ADDRESS ?? "") as Address;

// Target chain
export const PUB_CHAIN_NAME = (process.env.NEXT_PUBLIC_CHAIN_NAME ?? "holesky") as ChainName;
export const PUB_CHAIN = getChain(PUB_CHAIN_NAME);

// Network and services
export const PUB_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const PUB_WEB3_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;

export const PUB_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

export const PUB_WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const PUB_IPFS_ENDPOINTS = process.env.NEXT_PUBLIC_IPFS_ENDPOINTS ?? "";
export const PUB_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT ?? "";

// Private multisig
export const DETERMINISTIC_EMERGENCY_PAYLOAD =
  "This text is used to generate an encryption key to be used on private proposals targetting the Taiko DAO.\n\nSign this message ONLY if you are about to create, approve or execute a emergency proposal using the official Taiko app.";

// General
export const PUB_APP_NAME = "Taiko";
export const PUB_APP_DESCRIPTION = "Taiko's official UI to interact with the DAO smart contract";
export const PUB_TOKEN_SYMBOL = "TKO";

export const PUB_PROJECT_LOGO = "/logo-tk.svg";
export const PUB_PROJECT_URL = "https://taiko.xyz/";
export const PUB_BLOG_URL = "https://taiko.xyz/blog";
export const PUB_FORUM_URL = "https://community.taiko.xyz/";
export const PUB_WALLET_ICON = "https://avatars.githubusercontent.com/u/37784886";
