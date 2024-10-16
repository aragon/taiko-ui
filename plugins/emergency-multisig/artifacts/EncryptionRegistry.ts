export const EncryptionRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_addresslistSource",
        type: "address",
        internalType: "contract Addresslist",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "appointWallet",
    inputs: [
      {
        name: "_newAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRegisteredAddresses",
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
    name: "getRegisteredAddressesLength",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "members",
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
    name: "registeredAddresses",
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
        name: "_memberAddress",
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
    type: "event",
    name: "PublicKeySet",
    inputs: [
      {
        name: "member",
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
        name: "member",
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
    name: "NotAppointed",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnerNotAppointed",
    inputs: [],
  },
  {
    type: "error",
    name: "RegistrationForbidden",
    inputs: [],
  },
] as const;
