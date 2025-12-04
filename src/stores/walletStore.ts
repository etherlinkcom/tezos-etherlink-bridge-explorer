import { makeAutoObservable, runInAction } from 'mobx';
import { BrowserProvider, Signer } from 'ethers';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { networkStore } from './networkStore';

const ETHERLINK_CHAIN_ID: number = process.env.NEXT_PUBLIC_ETHERLINK_CHAIN_ID != null ? Number(process.env.NEXT_PUBLIC_ETHERLINK_CHAIN_ID): 42793;
const ETHERLINK_RPC_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com';
const ETHERLINK_NETWORK_NAME: string = process.env.NEXT_PUBLIC_ETHERLINK_NETWORK_NAME || 'Etherlink Mainnet';
const BLOCK_EXPLORER_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

let onboardInstance: ReturnType<typeof Onboard> | null = null;

const getOnboard = (): ReturnType<typeof Onboard> => {
  if (typeof window === 'undefined') {
    throw new Error('Onboard can only be initialized on the client side');
  }
  
  if (!onboardInstance) {
    onboardInstance = Onboard({
      wallets: [injectedModule()],
      chains: [
        {
          id: networkStore.config.chainId,
          token: 'XTZ',
          label: networkStore.config.networkName,
          rpcUrl: networkStore.config.rpcUrl,
          blockExplorerUrl: networkStore.config.blockExplorerUrl,
        },
      ],
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        },
      },
      theme: 'dark',
    });
  }
  
  return onboardInstance;
};

export class WalletStore {
  connectedAddress: string | null = null;
  connectedSigner: Signer | null = null;
  connectedWallet: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isConnected(): boolean {
    return this.connectedAddress !== null;
  }

  public async connectWallet(): Promise<Signer> {
    try {
      const onboard = getOnboard();
      const wallets = await onboard.connectWallet();

      if (!wallets || wallets.length === 0) throw new Error('No wallet selected');

      const wallet = wallets[0];
      const provider: BrowserProvider = new BrowserProvider(wallet.provider);
      const signer: Signer = await provider.getSigner();
      const address: string = await signer.getAddress();

      runInAction(() => {
        this.connectedAddress = address;
        this.connectedSigner = signer;
        this.connectedWallet = wallet.label;
      });

      if (!this.connectedSigner) throw new Error('Failed to get wallet signer');
      return this.connectedSigner;
    } catch (error: unknown) {
      if (error instanceof Error && (error.message.includes('User rejected') || error.message.includes('User closed'))) {
        throw new Error('Connection cancelled by user');
      }
      throw error;
    }
  }

  public async disconnect(): Promise<void> {    
    const onboard = getOnboard();
    const wallets = onboard.state.get().wallets;
    if (wallets.length > 0) {
      const [primaryWallet] = wallets;
      await onboard.disconnectWallet({ label: primaryWallet.label });
    }
    
    runInAction(() => {
      this.connectedAddress = null;
      this.connectedSigner = null;
      this.connectedWallet = null;
    });
  }
}

export const walletStore = new WalletStore();
