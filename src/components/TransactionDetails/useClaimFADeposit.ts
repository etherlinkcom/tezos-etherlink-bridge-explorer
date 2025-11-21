import { useState } from 'react';
import { Contract, DeferredTopicFilter, EventLog, JsonRpcProvider, Log, Signer, TransactionReceipt, TransactionResponse } from 'ethers';
import toast from 'react-hot-toast';
import { walletStore } from '@/stores/walletStore';
import { TezosTransaction, GraphQLResponse } from '@/stores/tezosTransactionStore';
import { CLAIM_ABI, QUEUED_DEPOSIT_ABI } from '@/abi/claimAbi';
import { fetchJson } from '@/utils/fetchJson';

const PRECOMPILE_ADDRESS: string = process.env.NEXT_PUBLIC_PRECOMPILE_ADDRESS || '0xff00000000000000000000000000000000000002';
const ETHERLINK_RPC_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com';
const BLOCK_EXPLORER_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

interface BlockscoutBlockResponse {
  status: string;
  result?: {
    blockNumber: string;
  };
  message?: string;
}

interface UseClaimFADepositReturn {
  isClaiming: boolean;
  isConnecting: boolean;
  error: string | null;
  txHash: string | null;
  handleConnectWallet: () => Promise<void>;
  claimDeposit: () => Promise<void>;
}

export const useClaimFADeposit = (transaction: TezosTransaction<GraphQLResponse>): UseClaimFADepositReturn => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

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
        console.error(`Error querying events from block ${startBlock}:`, error);
      }
    }
    
    return null;
  };

  const queryQueuedDepositNonce = async (): Promise<bigint | null> => {
    const provider: JsonRpcProvider = new JsonRpcProvider(ETHERLINK_RPC_URL);
    const contract: Contract = new Contract(PRECOMPILE_ADDRESS, QUEUED_DEPOSIT_ABI, provider);
    
    const l2BlockNumber: number | undefined = await getBlockNumberAtTimestamp(transaction.submittedDate);
    if (!l2BlockNumber) return null;
    return await queryEvents(contract, l2BlockNumber);
  };

  const parseClaimError = (error: unknown): string => {
    if (!(error instanceof Error)) return 'Failed to claim deposit';
    const { message } = error;
    if (message.includes('Could not find deposit') || message.includes('could not find deposit')) {
      return 'This deposit has already been claimed.';
    }
    if (message.includes('user rejected') || message.includes('User denied') || message.includes('User rejected')) {
      return 'Transaction was cancelled.';
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds to complete the transaction.';
    }
    return message;
  };

  const handleConnectWallet = async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      await walletStore.connectWallet();
      toast.success('Wallet connected successfully');
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const claimDeposit = async (): Promise<void> => {
    setIsClaiming(true);
    setError(null);
    setTxHash(null);

    try {
      const signer: Signer | null = walletStore.connectedSigner;
      if (!signer) {
        throw new Error('Wallet is not connected');
      }

      const nonce: bigint | null = await queryQueuedDepositNonce();
      if (!nonce) {
        throw new Error('Unable to claim the deposit at this time. The deposit may still be processing or may not be available for claiming.');
      }

      const claimContract: Contract = new Contract(PRECOMPILE_ADDRESS, CLAIM_ABI, signer);
      const tx: TransactionResponse = await claimContract.claim(nonce);
      const receipt: TransactionReceipt | null = await tx.wait();

      if (receipt?.hash) {
        setTxHash(receipt.hash);
      }
    } catch (error) {
      const errorMessage: string = parseClaimError(error);
      setError(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    isClaiming,
    isConnecting,
    error,
    txHash,
    handleConnectWallet,
    claimDeposit,
  };
};

