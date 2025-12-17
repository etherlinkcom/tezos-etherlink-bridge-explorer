export const CLAIM_ABI = [
  {
    inputs: [{ name: 'depositId', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];

export const QUEUED_DEPOSIT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'ticketHash', type: 'uint256' },
      { indexed: true, name: 'proxy', type: 'address' },
      { indexed: false, name: 'nonce', type: 'uint256' },
      { indexed: false, name: 'receiver', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'inboxLevel', type: 'uint256' },
      { indexed: false, name: 'inboxMsgId', type: 'uint256' }
    ],
    name: 'QueuedDeposit',
    type: 'event'
  }
];