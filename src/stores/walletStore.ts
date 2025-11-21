import { makeAutoObservable, runInAction } from 'mobx';
import { BrowserProvider, Signer } from 'ethers';
import { EthereumProvider } from '@/types/ethereum';

const ETHERLINK_CHAIN_ID = process.env.NEXT_PUBLIC_ETHERLINK_CHAIN_ID || '0xa729';
const ETHERLINK_RPC_URL = process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com';
const ETHERLINK_NETWORK_NAME = process.env.NEXT_PUBLIC_ETHERLINK_NETWORK_NAME || 'Etherlink Mainnet';
const BLOCK_EXPLORER_URL = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

export class WalletStore {
  connectedAddress: string | null = null;
  connectedSigner: Signer | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isConnected(): boolean {
    return this.connectedAddress !== null;
  }

  private get ethereum(): EthereumProvider | undefined {
    if (typeof window === 'undefined' || !window.ethereum) return undefined;
    return window.ethereum;
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
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
        await this.addEtherlinkNetwork();
      } else {
        throw error;
      }
    }
  }

  public async connectWallet(): Promise<Signer> {
    if (!this.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    await this.switchToEtherlinkNetwork();

    if (!this.connectedAddress || !this.connectedSigner) {
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
      });
    }

    if (!this.connectedSigner) throw new Error('Failed to get wallet signer');
    return this.connectedSigner;
  }
}

export const walletStore = new WalletStore();
