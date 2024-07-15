export const DelegateAnnouncerAbi = [
  {
    type: "function",
    name: "candidateAddresses",
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
    name: "candidateCount",
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
    name: "candidates",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "message",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "socialUrl",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCandidateAddresses",
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
    name: "register",
    inputs: [
      {
        name: "_message",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_socialUrl",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CandidateRegistered",
    inputs: [
      {
        name: "candidate",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "message",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "socialUrl",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "EmptyMessage",
    inputs: [],
  },
] as const;
