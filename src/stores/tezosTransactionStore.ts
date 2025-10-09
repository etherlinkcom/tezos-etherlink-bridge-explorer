import { makeAutoObservable, configure, observable, action } from "mobx";
import { toDecimalValue } from "@/utils/formatters";
import { fetchJson } from "@/utils/requestRetryHelper";

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
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
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
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
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
  error: string | null;
  l1TxHash: string;
  l2TxHash: string;
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
  error: string | null = null;
  l1TxHash: string;
  l2TxHash: string;
  kind: TezosTransactionKind | null;
  confirmation: Confirmation | undefined = undefined;
  completed = false;
  status: GraphTokenStatus;
  isFastWithdrawal?: boolean | undefined;
  l1Block?: number;
  l2Block?: number;
  
  constructor(props: TransactionConstructorProps<Input>) {
    makeAutoObservable(this, {
      update: action
    });
    this.chainId = props.chainId;
    this.l1TxHash = props.l1TxHash;
    this.l2TxHash = props.l2TxHash;
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
  // transactions: TezosTransaction[] = [];
  transactionMap = observable.map<string, TezosTransaction>();
  
  // Consolidated loading state
  loadingState: 'idle' | 'initial' | 'page' | 'refresh' = 'idle';
  
  // Computed loading flags for backward compatibility
  get loading() { return this.loadingState !== 'idle'; }
  get loadingInitial() { return this.loadingState === 'initial'; }
  get loadingMore() { return this.loadingState === 'page'; }
  get loadingRefresh() { return this.loadingState === 'refresh'; }
  get loadingPage() { return this.loadingState === 'page'; }
  
  error: string | null = null;
  // offset: number = 0;
  currentPage: number = 1;
  pageSize: number = 50; // UI page size for pagination
  batchSize: number = 2000; // API batch size for high-performance fetching
  private mostRecentTimestamp: string | null = null;
  
  // Memory management: prevent Map from growing indefinitely
  private readonly MAX_TRANSACTIONS = 5000; // Keep last 5000 transactions
  
  // TODO: Change this to Support network: mainnet, testnet
  private readonly graphqlEndpoint = 'https://bridge.indexer.etherlink.com/v1/graphql';
  private readonly TEZOS_BLOCK_TIME = 8000; // 8 seconds
  private refreshInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }

  get transactions(): TezosTransaction[] {
    return Array.from(this.transactionMap.values())
      .sort((a, b) => b.submittedDate - a.submittedDate);
  }

  get currentTransactions(): TezosTransaction[] {
    // Client-side pagination from large batch
    const offset = (this.currentPage - 1) * this.pageSize;
    return this.transactions.slice(offset, offset + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.transactionMap.size / this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  startAutoRefresh = () => {
    if (this.refreshInterval) return;
    
    console.log('Starting auto-refresh every 8 seconds');
    this.refreshInterval = setInterval(() => {
      if (this.loading) return;
      
      if (this.transactionMap.size === 0) {
        this.getTransactions({ limit: this.pageSize });
        return;
      }

      if (this.mostRecentTimestamp) {
        this.getTransactions({ since: this.mostRecentTimestamp });
      }
    }, this.TEZOS_BLOCK_TIME);
  };

  stopAutoRefresh = () => {
    if (this.refreshInterval) {
      console.log('Stopping auto-refresh');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
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
      // API gets without 0x
      const l2TxHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
      
      andConditions.push(`
        _or: [
          {deposit: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {deposit: {l2_transaction: {transaction_hash: {_eq: "${l2TxHash}"}}}},
          {withdrawal: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {withdrawal: {l2_transaction: {transaction_hash: {_eq: "${l2TxHash}"}}}}
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
      andConditions.push(`updated_at: {_gte: "${since}"}`);
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
              ticket {
                token {
                  decimals
                  name
                  symbol
                }
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
              ticket {
                token {
                  decimals
                  name
                  symbol
                }
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


  setError = (error: string | null) => {
    this.error = error;
  };


  setPage = (page: number) => {
    this.currentPage = page;
  };

  goToPage = (page: number) => {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.setPage(page);
    // That's it! currentTransactions getter handles the slicing
  };
  
  nextPage = () => {
    this.goToPage(this.currentPage + 1);
  };
  
  previousPage = () => {
    this.goToPage(this.currentPage - 1);
  };

private fetchBridgeOperations = async (filters: QueryFilters = {}): Promise<GraphQLResponse[]> => {
    const query = this.buildGraphQLQuery(filters);

    const response: { 
      data: { bridge_operation: GraphQLResponse[] };
      errors?: Array<{ message: string }>;
    } = await fetchJson(this.graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }, 5, 500);
    
    if (response.errors?.length) throw new Error(response.errors[0]?.message || 'Failed to fetch transactions');

    return response.data.bridge_operation;
  }

  private mapToTransactions = (operations: GraphQLResponse[]): TezosTransaction[] => {
    return operations.map(item => this.createTransaction(item));
  };

  private replaceTransactions = (transactions: TezosTransaction[]): void => {
    this.transactionMap.clear();
    transactions.forEach(tx => this.transactionMap.set(tx.input.id, tx));
    
    if (transactions.length > 0) {
      this.mostRecentTimestamp = transactions[0].input.updated_at;
    }
  };

  private mergeTransactions = (transactions: TezosTransaction[]): void => {
    transactions.forEach(tx => {
      const existing = this.transactionMap.get(tx.input.id);
      if (existing) {
        // Update existing instance to preserve observers and computed values
        existing.update(tx);
      } else {
        // Create new instance only for new transactions
        this.transactionMap.set(tx.input.id, tx);
      }
    });

    // Trim old transactions to prevent memory leak
    this.trimOldTransactions();

    if (transactions.length > 0) {
      const newestInBatch = transactions[0].input.updated_at;
      if (!this.mostRecentTimestamp || newestInBatch > this.mostRecentTimestamp) {
        this.mostRecentTimestamp = newestInBatch;
      }
    }
  };

  // Trim old transactions to prevent memory leak
  private trimOldTransactions = (): void => {
    if (this.transactionMap.size <= this.MAX_TRANSACTIONS) return;
    
    // Get all transactions sorted by date (newest first)
    const allTransactions = Array.from(this.transactionMap.values())
      .sort((a, b) => b.submittedDate - a.submittedDate);
    
    // Keep only the most recent MAX_TRANSACTIONS
    const toKeep = allTransactions.slice(0, this.MAX_TRANSACTIONS);
    const toRemove = allTransactions.slice(this.MAX_TRANSACTIONS);
    
    // Remove old transactions
    toRemove.forEach(tx => this.transactionMap.delete(tx.input.id));
    
    console.log(`🧹 Trimmed ${toRemove.length} old transactions. Map size: ${this.transactionMap.size}`);
  };
    
  
  getTransactions = async (filters: QueryFilters = {}): Promise<void> => {
    const isRefresh = !!filters.since;
    
    this.loadingState = isRefresh ? 'refresh' : 'initial';
    this.error = null;
    
    try {
      // Use batchSize for initial load, pageSize for pagination
      const limit = isRefresh ? this.pageSize : this.batchSize;
      const operations = await this.fetchBridgeOperations({ ...filters, limit });
      const transactions = this.mapToTransactions(operations);
      
      if (isRefresh) {
        this.mergeTransactions(transactions);  // Merge for auto-refresh
      } else {
        this.replaceTransactions(transactions);  // Replace for load/pagination
        this.currentPage = 1;
      }
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions');
    } finally {
      this.loadingState = 'idle';
    }
  };


  private createTransaction = (data: GraphQLResponse): TezosTransaction<GraphQLResponse> => {
    const isDeposit = data.type === 'deposit';
    const txData = isDeposit ? data.deposit : data.withdrawal;
    
    const l1AmountRaw = txData?.l1_transaction?.amount || '0';
    const l2AmountRaw = txData?.l2_transaction?.amount || '0';
    const l1Hash = txData?.l1_transaction?.operation_hash || '';
    const l2HashRaw = txData?.l2_transaction?.transaction_hash || '';
    const l2Hash = l2HashRaw && !l2HashRaw.startsWith('0x') ? `0x${l2HashRaw}` : l2HashRaw;
    
    const tokenMetadata = txData?.l2_transaction?.ticket?.token;
    console.log(tokenMetadata);
    const symbol = tokenMetadata?.symbol || 'UNKNOWN';
    const decimals = tokenMetadata?.decimals ?? 0;
    console.log("decimals", decimals);
    
    const l1Amount = toDecimalValue(Number(l1AmountRaw), decimals);
    const l2Amount = toDecimalValue(Number(l2AmountRaw), decimals);
    console.log("l1Amount", l1Amount, "l1AmountRaw", l1AmountRaw);
    console.log("l2Amount", l2Amount, "l2AmountRaw", l2AmountRaw);
    
    const l1Block = txData?.l1_transaction?.level;
    
    const l2Block = txData?.l2_transaction?.level !== null && txData?.l2_transaction?.level !== undefined
      ? txData.l2_transaction.level
      : undefined;
    
    return new TezosTransaction({
      type: data.type,
      input: data,
      sendingAmount: isDeposit ? l1Amount.toString() : l2Amount.toString(),
      receivingAmount: isDeposit ? l2Amount.toString() : l1Amount.toString(),
      symbol: symbol,
      decimals: decimals,
      chainId: 0,
      expectedDate: new Date(data.created_at).getTime(),
      submittedDate: new Date(data.created_at).getTime(),
      l1TxHash: l1Hash,
      l2TxHash: l2Hash,
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
