import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { BrowserProvider, Signer } from 'ethers';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { networkStore } from './networkStore';

export class WalletStore {
  private onboard?: ReturnType<typeof Onboard>;
  connectedAddress: string | null = null;
  connectedSigner: Signer | null = null;
  connectedWallet: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private createOnboard = (): ReturnType<typeof Onboard> => {
    const config = networkStore.config;
    return Onboard({
      wallets: [injectedModule()],
      chains: [
        {
          id: config.chainId,
          token: 'XTZ',
          label: config.networkName,
          rpcUrl: config.rpcUrl,
          blockExplorerUrl: config.etherlinkExplorerUrl,
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
  };

  get isConnected(): boolean {
    return this.connectedAddress !== null;
  }

  public async connectWallet(): Promise<Signer> {
    try {
      this.onboard = this.createOnboard();
      const wallets = await this.onboard.connectWallet();

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
    if (this.onboard) {
      const wallets = this.onboard.state.get().wallets;
      if (wallets.length > 0) {
        const [primaryWallet] = wallets;
        await this.onboard.disconnectWallet({ label: primaryWallet.label });
      }
    }
    
    runInAction(() => {
      this.connectedAddress = null;
      this.connectedSigner = null;
      this.connectedWallet = null;
    });
  }
}

export const walletStore = new WalletStore();
