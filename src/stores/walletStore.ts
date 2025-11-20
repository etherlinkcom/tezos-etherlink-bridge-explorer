import { makeAutoObservable, runInAction } from 'mobx';
import { BrowserProvider, Contract, JsonRpcProvider, Signer, TransactionReceipt, TransactionResponse } from 'ethers';
import { EthereumProvider } from '@/types/ethereum';

const ETHERLINK_CHAIN_ID = process.env.NEXT_PUBLIC_ETHERLINK_CHAIN_ID || '0xa729';
const ETHERLINK_RPC_URL = process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com';
const ETHERLINK_NETWORK_NAME = process.env.NEXT_PUBLIC_ETHERLINK_NETWORK_NAME || 'Etherlink Mainnet';
const BLOCK_EXPLORER_URL = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

export class WalletStore {
  connectedAddress: string | null = null;
  connectedSigner: Signer | null = null;
  error: string | null | undefined = null;
  private readOnlyProvider: JsonRpcProvider;

  constructor() {
    makeAutoObservable(this);
    this.readOnlyProvider = new JsonRpcProvider(ETHERLINK_RPC_URL);
  }

  private get ethereum(): EthereumProvider | undefined {
    if (typeof window === 'undefined' || !window.ethereum) return undefined;
    return window.ethereum;
  }

  public async connect(): Promise<{ address: string; signer: Signer }> {
    if (!this.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    const accounts: string[] = await this.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet accounts found');
    }

    const provider: BrowserProvider = new BrowserProvider(this.ethereum);
    const signer: Signer = await provider.getSigner();

    runInAction(() => {
      this.connectedAddress = accounts[0];
      this.connectedSigner = signer;
      this.error = null;
    });

    return { address: accounts[0], signer: signer };
  }

  public disconnect(): void {
    runInAction(() => {
      this.connectedAddress = null;
      this.connectedSigner = null;
      this.error = null;
    });
  }

  private async addEtherlinkNetwork(): Promise<void> {
    if (!this.ethereum) return;
    
    try {
      await this.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ETHERLINK_CHAIN_ID,
          chainName: ETHERLINK_NETWORK_NAME,
          nativeCurrency: {
            name: 'XTZ',
            symbol: 'XTZ',
            decimals: 18,
          },
          rpcUrls: [ETHERLINK_RPC_URL],
          blockExplorerUrls: [BLOCK_EXPLORER_URL],
        }],
      });
    } catch (error) {
      console.error('Failed to add Etherlink network:', error);
    }
  }

  private async switchToEtherlinkNetwork(): Promise<void> {
    if (!this.ethereum) return;

    const currentChainId: string = await this.ethereum.request({ 
      method: 'eth_chainId' 
    });

    if (currentChainId === ETHERLINK_CHAIN_ID) return;

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ETHERLINK_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        await this.addEtherlinkNetwork();
      }
    }
  }

  public async connectWallet(): Promise<Signer> {
    runInAction(() => {
      this.error = null;
    });

    try {
      await this.switchToEtherlinkNetwork();

      if (!this.connectedAddress || !this.connectedSigner) await this.connect();

      if (!this.connectedSigner) throw new Error('Failed to get wallet signer');
      return this.connectedSigner;

    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to connect wallet';
      runInAction(() => {
        this.error = errorMessage;
      });
      throw error;
    }
  }

  get isConnected(): boolean {
    return this.connectedAddress !== null;
  }

  getReadOnlyProvider(): JsonRpcProvider {
    return this.readOnlyProvider;
  }
}

export const walletStore = new WalletStore();

