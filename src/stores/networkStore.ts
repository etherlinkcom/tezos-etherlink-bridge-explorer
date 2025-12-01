import { makeAutoObservable, runInAction } from 'mobx';

export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  networkName: string;
  blockExplorerUrl: string;
  graphqlEndpoint: string;
}

const MAINNET_CONFIG: NetworkConfig = {
  chainId: 42793,
  rpcUrl: 'https://node.mainnet.etherlink.com',
  networkName: 'Etherlink Mainnet',
  blockExplorerUrl: 'https://explorer.etherlink.com',
  graphqlEndpoint: 'https://bridge.indexer.etherlink.com/v1/graphql',
};

const TESTNET_CONFIG: NetworkConfig = {
  chainId: 127823,
  rpcUrl: 'https://node.shadownet.etherlink.com',
  networkName: 'Etherlink Shadownet Testnet',
  blockExplorerUrl: 'https://shadownet.explorer.etherlink.com',
  graphqlEndpoint: 'https://shadownet.bridge.indexer.etherlink.com/v1/graphql',
};

const STORAGE_KEY: string = 'tezos-etherlink-selected-network';

export class NetworkStore {
  private _currentNetwork: NetworkType = 'mainnet';
  private _isInitialized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get currentNetwork(): NetworkType {
    return this._currentNetwork;
  }

  get config(): NetworkConfig {
    return this._currentNetwork === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  }

  get isMainnet(): boolean {
    return this._currentNetwork === 'mainnet';
  }

  get isTestnet(): boolean {
    return this._currentNetwork === 'testnet';
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  initialize = (): void => {
    if (this._isInitialized) return;
    
    this.loadNetworkFromStorage();
    this._isInitialized = true;
  };

  setNetwork = (network: NetworkType): void => {
    this._currentNetwork = network;
    this.saveNetworkToStorage();
  };

  toggleNetwork = (): void => {
    this.setNetwork(this._currentNetwork === 'mainnet' ? 'testnet' : 'mainnet');
  };

  private loadNetworkFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored: string | null = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mainnet' || stored === 'testnet') {
        runInAction(() => {
          this._currentNetwork = stored;
        });
      } else {
        const envNetwork: string | undefined = process.env.NEXT_PUBLIC_NETWORK;
        runInAction(() => {
          this._currentNetwork = envNetwork === 'testnet' ? 'testnet' : 'mainnet';
        });
      }
    } catch (error) {
      console.error('Failed to load network from storage:', error);
    }
  };

  private saveNetworkToStorage = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, this._currentNetwork);
    } catch (error) {
      console.error('Failed to save network to storage:', error);
    }
  };
}

export const networkStore = new NetworkStore();

