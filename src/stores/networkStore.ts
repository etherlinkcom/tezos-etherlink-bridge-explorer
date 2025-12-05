import { makeAutoObservable, runInAction } from 'mobx';
import { validateInput, ValidationResult } from '@/utils/validation';

export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  networkName: string;
  etherlinkExplorerUrl: string;
  tezosExplorerUrl: string;
  graphqlEndpoint: string;
}

const MAINNET_CONFIG: NetworkConfig = {
  chainId: 42793,
  rpcUrl: 'https://node.mainnet.etherlink.com',
  networkName: 'Etherlink Mainnet',
  etherlinkExplorerUrl: 'https://explorer.etherlink.com',
  tezosExplorerUrl: 'https://tzkt.io',
  graphqlEndpoint: 'https://bridge.indexer.etherlink.com/v1/graphql',
};

const TESTNET_CONFIG: NetworkConfig = {
  chainId: 127823,
  rpcUrl: 'https://node.shadownet.etherlink.com',
  networkName: 'Etherlink Shadownet Testnet',
  etherlinkExplorerUrl: 'https://shadownet.explorer.etherlink.com',
  tezosExplorerUrl: 'https://shadownet.tzkt.io',
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

  getExplorerInfo = (value: string | undefined): { url: string; name: string } | null => {
    if (!value || value === '-') return null;
    
    const trimmed: string = value.trim();
    const config: NetworkConfig = this.config;
    const validation: ValidationResult = validateInput(trimmed);
    
    if (validation.type === 'tezos_tx_hash' || validation.type === 'tezos_address') {
      return {
        url: `${config.tezosExplorerUrl}/${trimmed}`,
        name: 'TzKT Explorer'
      };
    }
    
    if (validation.type === 'etherlink_tx_hash') {
      return {
        url: `${config.etherlinkExplorerUrl}/tx/${trimmed}`,
        name: 'Etherlink Explorer'
      };
    }
    
    if (validation.type === 'etherlink_address') {
      return {
        url: `${config.etherlinkExplorerUrl}/address/${trimmed}`,
        name: 'Etherlink Explorer'
      };
    }
    
    return null;
  };

  private loadNetworkFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored: string | null = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mainnet' || stored === 'testnet') {
        runInAction(() => {
          this._currentNetwork = stored;
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

