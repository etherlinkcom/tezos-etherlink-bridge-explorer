import { makeAutoObservable, configure } from "mobx";

// configure({
//   enforceActions: "never"
// });

type TransactionType = string;
type Confirmation = { txHash: string; chainId: number };
export type TezosTransactionType = "withdrawal" | "deposit";
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface QueryFilters {
  limit?: number;
  offset?: number;
  txHash?: string;
  address?: string;
  level?: number;
  since?: string;  // ISO timestamp for fetching new transactions
  before?: string; // ISO timestamp for pagination
}

export type TezosTransactionKind = string;

interface GraphQLResponse {
  id: string;
  created_at: string;
  updated_at: string;
  l1_account: string;
  l2_account: string;
  status: GraphTokenStatus;
  is_successful: boolean;
  is_completed: boolean;
  type: TezosTransactionType;
  kind: TezosTransactionKind | null;
  deposit: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      level: number | null;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
      level: number;
    };
  };
  withdrawal: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      level: number | null;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
      level: number;
    };
  };
}

export enum GraphTokenStatus {
  Pending = "PENDING",
  Created = "CREATED",
  Sealed = "SEALED",
  Finished = "FINISHED",
  Failed = "FAILED",
}

interface TransactionProps<Input> {
  type: TransactionType;
  input: Input;
  sendingAmount: string;
  receivingAmount: string | undefined;
  symbol: string;
  decimals: number;
  chainId: number;
  expectedDate: number;
  submittedDate: number;
  error: unknown | undefined;
  txHash: string;
  kind: TezosTransactionKind | null;
  confirmation: Confirmation | undefined;
  completed: boolean;
  status: GraphTokenStatus;
  isFastWithdrawal?: boolean;
  l1Block?: number;
  l2Block?: number;
}
type TransactionConstructorProps<Input> = Optional<
  TransactionProps<Input>,
  "confirmation" | "completed" | "error" | "completed"
>;

export class TezosTransaction<Input = GraphQLResponse>
  implements TransactionProps<Input>
{
  type: TransactionType;
  input: Input;
  sendingAmount: string;
  receivingAmount: string | undefined;
  symbol: string;
  decimals: number;
  chainId: number;
  expectedDate: number;
  submittedDate: number;
  error: string | undefined = undefined;
  txHash: string;
  kind: TezosTransactionKind | null;
  confirmation: Confirmation | undefined = undefined;
  completed = false;
  status: GraphTokenStatus;
  isFastWithdrawal?: boolean | undefined;
  l1Block?: number;
  l2Block?: number;
  
  constructor(props: TransactionConstructorProps<Input>) {
    makeAutoObservable(this);
    this.chainId = props.chainId;
    this.txHash = props.txHash;
    this.expectedDate = props.expectedDate;
    this.submittedDate = props.submittedDate;
    this.input = props.input;
    this.type = props.type;
    this.sendingAmount = props.sendingAmount;
    this.receivingAmount = props.receivingAmount;
    this.symbol = props.symbol;
    this.decimals = props.decimals;
    this.status = props.status;
    this.isFastWithdrawal = props.isFastWithdrawal || false;
    this.l1Block = props.l1Block;
    this.l2Block = props.l2Block;
    this.kind = props.kind;
  }

  update(props: Partial<TransactionProps<Input>>) {
    Object.assign(this, props);
  }
}

export class TezosTransactionStore {
  transactions: TezosTransaction[] = [];
  
  // TODO: when components are implemented later, check these fields then
  loading: boolean = false;              // General loading (kept for backward compatibility)
  loadingInitial: boolean = false;       // Initial page load
  loadingMore: boolean = false;          // Load More button
  loadingRefresh: boolean = false;       // Background auto-refresh
  loadingPage: boolean = false;          // Page navigation
  
  error: string | null = null;
  searchTerm: string = "";
  offset: number = 0;
  hasMore: boolean = true;
  
  currentPage: number = 1;
  pageSize: number = 50;
  totalPages: number = 1;
  
  // TODO: Change this to Support network: mainnet, testnet
  private readonly graphqlEndpoint = 'https://bridge.indexer.etherlink.com/v1/graphql';
  private readonly TEZOS_BLOCK_TIME = 8000; // 8 seconds
  private readonly MAX_RETRIES = 3;
  private refreshInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }

  startAutoRefresh = () => {
    if (this.refreshInterval) return;
    
    console.log('Starting auto-refresh every 8 seconds');
    this.refreshInterval = setInterval(() => {
      this.fetchNewTransactions();
    }, this.TEZOS_BLOCK_TIME);
  };

  stopAutoRefresh = () => {
    if (this.refreshInterval) {
      console.log('Stopping auto-refresh');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  };

  private fetchWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = this.MAX_RETRIES,
    delay = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      
      console.warn(`Request failed, retrying... (${retries} attempts left)`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.fetchWithRetry(fn, retries - 1, delay * 2);
    }
  };

  private handleError = (error: unknown, context: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${context}] Error:`, errorMessage);
    this.setError(`${context}: ${errorMessage}`);
  };

  private buildGraphQLQuery = (filters: QueryFilters = {}) => {
    const {
      limit = this.pageSize,
      offset = 0,
      txHash,
      address,
      level,
      since,
      before
    } = filters;

    const andConditions: string[] = [];

    if (txHash) {
      andConditions.push(`
        _or: [
          {deposit: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {deposit: {l2_transaction: {transaction_hash: {_eq: "${txHash}"}}}},
          {withdrawal: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {withdrawal: {l2_transaction: {transaction_hash: {_eq: "${txHash}"}}}}
        ]
      `);
    } else if (address) {
      andConditions.push(`
        _or: [
          {l1_account: {_eq: "${address}"}},
          {l2_account: {_eq: "${address}"}}
        ]
      `);
    } else if (level !== undefined) {
      andConditions.push(`
        _or: [
          {deposit: {l1_transaction: {level: {_eq: ${level}}}}},
          {deposit: {l2_transaction: {level: {_eq: ${level}}}}},
          {withdrawal: {l1_transaction: {level: {_eq: ${level}}}}},
          {withdrawal: {l2_transaction: {level: {_eq: ${level}}}}}
        ]
      `);
    }

    if (since) {
      andConditions.push(`created_at: {_gt: "${since}"}`);
    }

    if (before) {
      andConditions.push(`created_at: {_lt: "${before}"}`);
    }

    const whereClause = andConditions.length > 0
      ? `where: {_and: [${andConditions.map(cond => `{${cond}}`).join(', ')}]}`
      : '';

    return `
      query GetTransactions {
        bridge_operation(
          ${whereClause}
          limit: ${limit}
          offset: ${offset}
          order_by: {updated_at: desc}
        ) {
          id
          created_at
          updated_at
          l1_account
          l2_account
          status
          is_successful
          is_completed
          type
          kind
          deposit {
            l2_transaction {
              token_id
              amount
              transaction_hash
              level
              l2_token {
                decimals
                name
                symbol
              }
            }
            l1_transaction {
              amount
              operation_hash
              level
            }
          }
          withdrawal {
            l2_transaction {
              token_id
              amount
              transaction_hash
              level
              l2_token {
                decimals
                name
                symbol
              }
            }
            l1_transaction {
              amount
              operation_hash
              level
            }
          }
        }
      }
    `;
  };

  setLoadingInitial = (loading: boolean) => {
    this.loadingInitial = loading;
    this.loading = loading; // Keep general loading in sync
  };

  setLoadingMore = (loading: boolean) => {
    this.loadingMore = loading;
  };

  setLoadingRefresh = (loading: boolean) => {
    this.loadingRefresh = loading;
  };

  setLoadingPage = (loading: boolean) => {
    this.loadingPage = loading;
    this.loading = loading;
  };

  setError = (error: string | null) => {
    this.error = error;
  };

  setPage = (page: number) => {
    this.currentPage = page;
  };

  nextPage = async () => {
    if (this.currentPage < this.totalPages && !this.loadingPage) {
      this.setPage(this.currentPage + 1);
      this.setLoadingPage(true);
      try {
        await this.fetchTransactions({ 
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize 
        });
      } finally {
        this.setLoadingPage(false);
      }
    }
  };

  previousPage = async () => {
    if (this.currentPage > 1 && !this.loadingPage) {
      this.setPage(this.currentPage - 1);
      this.setLoadingPage(true);
      try {
        await this.fetchTransactions({ 
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize 
        });
      } finally {
        this.setLoadingPage(false);
      }
    }
  };

  goToPage = async (page: number) => {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage && !this.loadingPage) {
      this.setPage(page);
      this.setLoadingPage(true);
      try {
        await this.fetchTransactions({ 
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize 
        });
      } finally {
        this.setLoadingPage(false);
      }
    }
  };

  fetchTransactions = async (filters: QueryFilters = {}) => {
    this.setLoadingInitial(true);
    this.setError(null);

    const defaultFilters = {
      limit: this.pageSize,
      ...filters
    };

    try {
      const data = await this.fetchWithRetry(async () => {
        const query = this.buildGraphQLQuery(defaultFilters);
        
        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        return data;
      });

      const newTransactions = data.data.bridge_operation
        .map((item: GraphQLResponse) => this.createTransaction(item));
      
      this.transactions = newTransactions;
      this.offset = defaultFilters.offset || 0;
      this.hasMore = newTransactions.length === defaultFilters.limit;
      

      if (newTransactions.length < defaultFilters.limit) {
        this.totalPages = this.currentPage;
      } else {
        this.totalPages = this.currentPage + 1;
      }
      
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions');
    } finally {
      this.setLoadingInitial(false);
    }
  };

  // Fetch new transactions since last fetch for auto-refresh
  fetchNewTransactions = async () => {
    if (this.loadingInitial || this.loadingPage || this.loadingRefresh) return;
    
    this.setLoadingRefresh(true);
    
    try {
      if (this.transactions.length === 0) {
        await this.fetchTransactions({ limit: this.pageSize });
        return;
      }

      const mostRecentUpdatedAt = this.transactions[0]?.input.updated_at;
      
      if (!mostRecentUpdatedAt) {
        await this.fetchTransactions({ limit: this.pageSize });
        return;
      }

      const data = await this.fetchWithRetry(async () => {
        const query = this.buildGraphQLQuery({ 
          since: mostRecentUpdatedAt 
        });
        
        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        return data;
      });

      const updatedTransactions = data.data.bridge_operation
        .map((item: GraphQLResponse) => this.createTransaction(item));

      if (updatedTransactions.length === 0) return;

      const existingMap = new Map(
        this.transactions.map(tx => [tx.input.id, tx])
      );
      
      const newTxs: TezosTransaction<GraphQLResponse>[] = [];
      
      for (const tx of updatedTransactions) {
        if (existingMap.has(tx.input.id)) {
          const existingIndex = this.transactions.findIndex(t => t.input.id === tx.input.id);
          if (existingIndex !== -1) {
            this.transactions[existingIndex] = tx;
          }
        } else {
          newTxs.push(tx);
        }
      }
      
      if (newTxs.length > 0) {
        this.transactions.unshift(...newTxs);
        console.log(`Added ${newTxs.length} new transactions`);
        
        if (this.transactions.length > this.pageSize) {
          this.transactions = this.transactions.slice(0, this.pageSize);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch new transactions:', error);
    } finally {
      this.setLoadingRefresh(false);
    }
  };

  loadMore = async () => {
    if (this.loadingMore || !this.hasMore) {
      return;
    }
    
    this.setLoadingMore(true);
    
    try {
      const oldestTx = this.transactions[this.transactions.length - 1];
      const oldestTimestamp = oldestTx?.submittedDate;
      
      if (!oldestTimestamp) {
        await this.fetchTransactions({ limit: this.pageSize });
        return;
      }
      
      const before = new Date(oldestTimestamp).toISOString();
      
      const data = await this.fetchWithRetry(async () => {
        const query = this.buildGraphQLQuery({ 
          limit: this.pageSize,
          before: before
        });
        
        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        return data;
      });

      const olderTransactions = data.data.bridge_operation
        .map((item: GraphQLResponse) => this.createTransaction(item));
      
      this.transactions.push(...olderTransactions);
      this.hasMore = olderTransactions.length === this.pageSize;
      
    } catch (error) {
      this.handleError(error, 'Failed to load more');
    } finally {
      this.setLoadingMore(false);
    }
  };

  private createTransaction = (data: GraphQLResponse): TezosTransaction<GraphQLResponse> => {
    const isDeposit = data.type === 'deposit';
    const txData = isDeposit ? data.deposit : data.withdrawal;
    
    const l1Amount = txData?.l1_transaction?.amount || '0';
    const l2Amount = txData?.l2_transaction?.amount || '0';
    const l1Hash = txData?.l1_transaction?.operation_hash || '';
    const l2Hash = txData?.l2_transaction?.transaction_hash || '';
    const symbol = txData?.l2_transaction?.l2_token?.symbol || 'XTZ';
    const decimals = txData?.l2_transaction?.l2_token?.decimals || 6;
    
    // Note: For withdrawals, L1 transaction may not exist yet if not finalized
    const l1Block = txData?.l1_transaction?.level;
    
    const l2Block = txData?.l2_transaction?.level !== null && txData?.l2_transaction?.level !== undefined
      ? txData.l2_transaction.level
      : undefined;
    
    return new TezosTransaction({
      type: data.type,
      input: data,
      sendingAmount: isDeposit ? l1Amount : l2Amount,
      receivingAmount: isDeposit ? l2Amount : l1Amount,
      symbol: symbol,
      decimals: decimals,
      chainId: 0,
      expectedDate: new Date(data.created_at).getTime(),
      submittedDate: new Date(data.created_at).getTime(),
      txHash: (isDeposit ? l1Hash : l2Hash) || data.id,
      status: data.status,
      completed: data.is_completed,
      l1Block: l1Block,
      l2Block: l2Block,
      kind: data.kind,
    });
  };
}

export const tezosTransactionStore = new TezosTransactionStore();

// Only for testing purposes
if (typeof window !== 'undefined') {
  (window as any).store = tezosTransactionStore;
}
