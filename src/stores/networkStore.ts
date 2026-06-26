import { makeAutoObservable, runInAction } from 'mobx';

export type NetworkType = 'mainnet' | 'testnet' | 'previewnet';

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  networkName: string;
  etherlinkExplorerUrl: string;
  tezosExplorerUrl: string;
  tezosExplorerApiUrl: string;
  graphqlEndpoint: string;
  // Bridge indexer schema. 'etherlink' (default) exposes l2_account as a scalar;
  // 'dipdup' (previewnet) exposes it as a relation with the scalar at l2_account_id.
  indexerKind?: 'etherlink' | 'dipdup';
  // Dual-runtime networks (previewnet) have a separate Michelson L2 interface.
  michelsonExplorerUrl?: string; // Michelson L2 explorer (TzKT); API base derived as api.<host>
  gatewayContract?: string;      // Michelson L2 bridge gateway (call_evm) for exit-op lookup
  l2Name?: string;               // L2 display name (default 'Etherlink'; previewnet is 'Tezos X')
}

const CONFIGS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    chainId: 42793,
    rpcUrl: 'https://node.mainnet.etherlink.com',
    networkName: 'Etherlink Mainnet',
    etherlinkExplorerUrl: 'https://explorer.etherlink.com',
    tezosExplorerUrl: 'https://tzkt.io',
    tezosExplorerApiUrl: 'https://api.tzkt.io',
    graphqlEndpoint: 'https://bridge.indexer.etherlink.com/v1/graphql',
  },
  testnet: {
    chainId: 127823,
    rpcUrl: 'https://node.shadownet.etherlink.com',
    networkName: 'Etherlink Shadownet Testnet',
    etherlinkExplorerUrl: 'https://shadownet.explorer.etherlink.com',
    tezosExplorerUrl: 'https://shadownet.tzkt.io',
    tezosExplorerApiUrl: 'https://api.shadownet.tzkt.io',
    graphqlEndpoint: 'https://shadownet.bridge.indexer.etherlink.com/v1/graphql',
  },
  previewnet: {
    chainId: 128064,
    rpcUrl: 'https://evm.previewnet.tezosx.nomadic-labs.com',
    networkName: 'Tezos X Previewnet',
    etherlinkExplorerUrl: 'https://blockscout.previewnet.tezosx.nomadic-labs.com',
    // Previewnet bridges to Shadownet L1, so L1 ops resolve on Shadownet's TzKT.
    tezosExplorerUrl: 'https://shadownet.tzkt.io',
    tezosExplorerApiUrl: 'https://api.shadownet.tzkt.io',
    graphqlEndpoint: 'https://tezosx-bridge-shadownet.dipdup.net/v1/graphql',
    indexerKind: 'dipdup',
    michelsonExplorerUrl: 'https://previewnet.tezosx.tzkt.io',
    gatewayContract: 'KT18oDJJKXMKhfE1bSuAPGp92pYcwVDiqsPw',
    l2Name: 'Tezos X',
  },
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
    return CONFIGS[this._currentNetwork];
  }

  get networks(): NetworkType[] {
    return Object.keys(CONFIGS) as NetworkType[];
  }

  getConfig = (network: NetworkType): NetworkConfig => CONFIGS[network];

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

  private loadNetworkFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored: string | null = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored in CONFIGS) {
        runInAction(() => {
          this._currentNetwork = stored as NetworkType;
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

