export interface EthereumProvider {
  request(args: { method: 'eth_requestAccounts' }): Promise<string[]>;
  request(args: { method: 'eth_accounts' }): Promise<string[]>;
  request(args: { method: 'eth_chainId' }): Promise<string>;
  request(args: { method: 'wallet_switchEthereumChain'; params: [{ chainId: string }] }): Promise<null>;
  request(args: { method: 'wallet_addEthereumChain'; params: [AddEthereumChainParameter] }): Promise<null>;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  isMetaMask?: boolean;
  on?(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on?(event: 'disconnect', handler: () => void): void;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

export interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

