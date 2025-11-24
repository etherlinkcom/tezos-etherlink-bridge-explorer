import { useState } from 'react';
import { Contract, DeferredTopicFilter, EventLog, JsonRpcProvider, Log, Signer, TransactionReceipt, TransactionResponse } from 'ethers';
import { walletStore } from '@/stores/walletStore';
import { TezosTransaction, GraphQLResponse } from '@/stores/tezosTransactionStore';
import { CLAIM_ABI, QUEUED_DEPOSIT_ABI } from '@/abi/claimAbi';
import { fetchJson } from '@/utils/fetchJson';

const PRECOMPILE_ADDRESS: string = process.env.NEXT_PUBLIC_PRECOMPILE_ADDRESS || '0xff00000000000000000000000000000000000002';
const ETHERLINK_RPC_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com';
const BLOCK_EXPLORER_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';
const PROVIDER: JsonRpcProvider = new JsonRpcProvider(ETHERLINK_RPC_URL);

interface BlockscoutBlockResponse {
  status: string;
  result?: {
    blockNumber: string;
  };
  message?: string;
}

export interface UseClaimFADepositReturn {
  isClaiming: boolean;
  isConnecting: boolean;
  error: string | null;
  txHash: string | null;
  needsSupport: boolean;
  handleConnectWallet: () => Promise<Signer | null>;
  claimDeposit: () => Promise<void>;
}

export const useClaimFADeposit = (transaction: TezosTransaction<GraphQLResponse>): UseClaimFADepositReturn => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [needsSupport, setNeedsSupport] = useState<boolean>(false);

  const receiverAddress: string = transaction.input.l2_account;

  const getBlockNumberAtTimestamp = async (timestamp: number): Promise<number | undefined> => {
    const timestampInSeconds: number = Math.floor(timestamp / 1000);
    
    try {
      const url: string = `${BLOCK_EXPLORER_URL}/api?module=block&action=getblocknobytime&timestamp=${timestampInSeconds}&closest=before`;
      const data: BlockscoutBlockResponse = await fetchJson(url);
      
      if (data.status === '1' && data.message === 'OK' && data.result && data.result.blockNumber) {
        const blockNumber: number = Number(data.result.blockNumber);
        return blockNumber;
      }
    } catch (error) {
      console.log('Failed to get block number from Blockscout API: ' + error);
    }
    return undefined;
  };

  const queryQueuedDepositNonce = async (): Promise<bigint | null> => {
    if (transaction.depositNonce !== undefined) return transaction.depositNonce;
    
    const contract: Contract = new Contract(PRECOMPILE_ADDRESS, QUEUED_DEPOSIT_ABI, PROVIDER);
    const l2BlockNumber: number | undefined = await getBlockNumberAtTimestamp(transaction.submittedDate);
    if (!l2BlockNumber) return null;
    
    const nonce: bigint | null = await queryEvents(contract, l2BlockNumber);
    transaction.depositNonce = nonce;
    return nonce;
  };

  const findMatchingEvent = (events: Array<EventLog | Log>): bigint | null => {
    if (!receiverAddress) return null;
    const normalizedReceiverAddress: string = `0x${receiverAddress.toLowerCase()}`;
    
    for (const event of events) {
      if (event instanceof EventLog) {
        const eventReceiver: string = event.args[1];
        
        if (eventReceiver.toLowerCase() === normalizedReceiverAddress) {
          const nonce: bigint = event.args[0];
          return nonce;
        }
      }
    }
    return null;
  };

  const queryEvents = async (contract: Contract, blockNumber: number): Promise<bigint | null> => {
    const increment: number = 499;
    const maxBlockNumber: number = blockNumber + (3 * increment);

    for (let startBlock: number = blockNumber - increment; startBlock < maxBlockNumber; startBlock += increment) {
      try {
        const filter: DeferredTopicFilter = contract.filters.QueuedDeposit();
        const events: Array<EventLog | Log> = await contract.queryFilter(filter, startBlock, startBlock + increment);
        const nonce: bigint | null = findMatchingEvent(events);
        
        if (nonce !== null) return nonce;
      } catch (error) {
        console.log('Error querying events from block ' + startBlock + ': ' + error);
      }
    }
    
    return null;
  };

  const parseClaimError = (error: unknown): { message: string; needsSupport: boolean } => {
    if (!(error instanceof Error)) {
      return { message: 'Failed to claim deposit', needsSupport: true };
    }
    const { message } = error;
    
    if (message.includes('user rejected') || message.includes('User denied') || message.includes('User rejected')) {
      return { message: 'Transaction was cancelled.', needsSupport: false };
    }
    if (message.includes('insufficient funds')) {
      return { message: 'Insufficient funds to complete the transaction.', needsSupport: false };
    }
    if (message.includes('Wallet is not connected')) {
      return { message: 'Wallet is not connected', needsSupport: false };
    }
    
    if (message.includes('Could not find deposit') || message.includes('could not find deposit')) {
      return { message: 'This deposit has already been claimed.', needsSupport: true };
    }
    
    return { message, needsSupport: true };
  };

  const handleConnectWallet = async (): Promise<Signer | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      const signer: Signer = await walletStore.connectWallet();
      return signer;
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const claimDeposit = async (): Promise<void> => {
    setIsClaiming(true);
    setError(null);
    setTxHash(null);
    setNeedsSupport(false);

    try {
      const nonce: bigint | null = await queryQueuedDepositNonce();
      if (!nonce) throw new Error('Could not find deposit');

      const signer: Signer | null = await handleConnectWallet();
      if (!signer) return;

      const claimContract: Contract = new Contract(PRECOMPILE_ADDRESS, CLAIM_ABI, signer);
      const tx: TransactionResponse = await claimContract.claim(nonce);
      const receipt: TransactionReceipt | null = await tx.wait();

      if (receipt?.hash) setTxHash(receipt.hash);
    } catch (error) {
      const { message, needsSupport: errorNeedsSupport } = parseClaimError(error);
      setError(message);
      setNeedsSupport(errorNeedsSupport);
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    isClaiming,
    isConnecting,
    error,
    txHash,
    needsSupport,
    handleConnectWallet,
    claimDeposit,
  };
};

