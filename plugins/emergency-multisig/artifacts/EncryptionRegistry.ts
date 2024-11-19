export const EncryptionRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_addresslist",
        type: "address",
        internalType: "contract Addresslist",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "accounts",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "appointedWallet",
        type: "address",
        internalType: "address",
      },
      {
        name: "publicKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "appointWallet",
    inputs: [
      {
        name: "_newWallet",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "appointedBy",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAppointedWallet",
    inputs: [
      {
        name: "_member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegisteredAccounts",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registeredAccounts",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setOwnPublicKey",
    inputs: [
      {
        name: "_publicKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPublicKey",
    inputs: [
      {
        name: "_accountOwner",
        type: "address",
        internalType: "address",
      },
      {
        name: "_publicKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "_interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PublicKeySet",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "publicKey",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WalletAppointed",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "appointedWallet",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AlreadyAppointed",
    inputs: [],
  },
  {
    type: "error",
    name: "CannotAppointContracts",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAddressList",
    inputs: [],
  },
  {
    type: "error",
    name: "MustBeAppointed",
    inputs: [],
  },
  {
    type: "error",
    name: "MustBeListed",
    inputs: [],
  },
  {
    type: "error",
    name: "MustResetAppointment",
    inputs: [],
  },
] as const;
