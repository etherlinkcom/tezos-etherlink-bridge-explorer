import { makeAutoObservable, observable, action } from "mobx";
import { toDecimalValue } from "@/utils/formatters";
import { fetchJson } from "@/utils/fetchJson";


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
  tokenSymbol?: string;
  isFastWithdrawal?: boolean; 
}

interface GetTransactionsOptions extends QueryFilters {
  resetStore?: boolean;
  autoRefresh?: boolean;
  loadingMode?: 'initial' | 'page' | 'refresh';
}

export type TezosTransactionKind =
  "fast_withdrawal" |
  "fast_withdrawal_service_provider" |
  "fast_withdrawal_payed_out" |
  "fast_withdrawal_payed_out_expired" |
  "fast_withdrawal_payed_out_reward" | null

export interface GraphQLResponse {
  id: string;
  created_at: string;
  updated_at: string;
  l1_account: string;
  l2_account: string;
  status: GraphTokenStatus;
  is_successful: boolean;
  is_completed: boolean;
  type: TezosTransactionType;
  kind: TezosTransactionKind;
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
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
      };
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
  chainId: number;
  expectedDate?: number;
  submittedDate: number;
  completedDate?: number;
  error: string | null;
  l1TxHash: string;
  l2TxHash: string;
  kind: TezosTransactionKind | null;
  confirmation: Confirmation | undefined;
  completed: boolean;
  status: GraphTokenStatus;
  destinationStatus: GraphTokenStatus;
  isFastWithdrawal?: boolean;
  l1Block?: number;
  l2Block?: number;
  fastWithdrawalPayOut?: TezosTransaction;
}
type TransactionConstructorProps<Input> = Optional<
  TransactionProps<Input>,
  "confirmation" | "error"
>;

export class TezosTransaction<Input = GraphQLResponse>
  implements TransactionProps<Input>
{
  type: TransactionType;
  input: Input;
  sendingAmount: string;
  receivingAmount: string | undefined;
  symbol: string;
  chainId: number;
  expectedDate?: number;
  submittedDate: number;
  completedDate?: number;
  error: string | null = null;
  l1TxHash: string;
  l2TxHash: string;
  kind: TezosTransactionKind;
  confirmation: Confirmation | undefined = undefined;
  completed = false;
  status: GraphTokenStatus;
  destinationStatus: GraphTokenStatus;
  isFastWithdrawal?: boolean | undefined;
  l1Block?: number;
  l2Block?: number;
  fastWithdrawalPayOut?: TezosTransaction;
  
  constructor(props: TransactionConstructorProps<Input>) {
    makeAutoObservable(this, {
      update: action
    });
    this.chainId = props.chainId;
    this.l1TxHash = props.l1TxHash;
    this.l2TxHash = props.l2TxHash;
    this.expectedDate = props.expectedDate;
    this.submittedDate = props.submittedDate;
    this.completedDate = props.completedDate;
    this.input = props.input;
    this.type = props.type;
    this.sendingAmount = props.sendingAmount;
    this.receivingAmount = props.receivingAmount;
    this.symbol = props.symbol;
    this.status = props.status;
    this.destinationStatus = props.destinationStatus;
    this.completed = props.completed;
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
  transactionMap = observable.map<string, TezosTransaction>();
  private _transactions = observable.array<TezosTransaction>([]);
  
  loadingState: 'idle' | 'initial' | 'page' | 'refresh' = 'idle';
  
  get loading() { return this.loadingState !== 'idle'; }
  get loadingInitial() { return this.loadingState === 'initial'; }
  get loadingMore() { return this.loadingState === 'page'; }
  get loadingRefresh() { return this.loadingState === 'refresh'; }
  get loadingPage() { return this.loadingState === 'page'; }
  
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 50; // UI page size for pagination
  batchSize: number = 1000; // API batch size for fetching
  
  private readonly MAX_TRANSACTIONS = 5000;
  private readonly graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://bridge.indexer.etherlink.com/v1/graphql';
  private readonly AUTO_REFRESH_INTERVAL = 50000; // 5 mins
  private refreshInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  get transactions(): TezosTransaction[] {
    return this._transactions;
  }

  get currentTransactions(): TezosTransaction[] {
    const offset: number = (this.currentPage - 1) * this.pageSize;
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
    
    this.refreshInterval = setInterval(async () => {
      if (this.loading) return;
      
      if (this.transactionMap.size === 0) {
        await this.getTransactions({ resetStore: true ,loadingMode: 'initial' });
        return;
      }
      if (this.transactions.length > 0) {
        await this.getTransactions({ autoRefresh: true, loadingMode: 'refresh' });
      }
      
    }, this.AUTO_REFRESH_INTERVAL);
  };

  stopAutoRefresh = () => {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  };

  private handleError = (error: unknown, context: string) => {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Error in ${context}: ${errorMessage}`);
    this.setError(`${context}: ${errorMessage}`);
  };

  private buildGraphQLQuery = (filters: QueryFilters = {}): string => {
    const {
      limit = this.pageSize,
      offset = 0,
      txHash,
      address,
      level,
      since,
      before,
      tokenSymbol,
      isFastWithdrawal
    } = filters;

    const andConditions: string[] = [];

    if (txHash) {
      // API gets without 0x
      const l2TxHash: string = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
      
      andConditions.push(`
        _or: [
          {deposit: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {deposit: {l2_transaction: {transaction_hash: {_eq: "${l2TxHash}"}}}},
          {withdrawal: {l1_transaction: {operation_hash: {_eq: "${txHash}"}}}},
          {withdrawal: {l2_transaction: {transaction_hash: {_eq: "${l2TxHash}"}}}}
        ]
      `);
      // API gets without 0x
    } else if (address) {
      const addressWithout0x: string = address.startsWith('0x') ? address.slice(2) : address;
      andConditions.push(`
        _or: [
          {l1_account: {_eq: "${address}"}},
          {l2_account: {_eq: "${addressWithout0x}"}}
        ]
      `);
    } else if (level) {
      andConditions.push(`
        _or: [
          {deposit: {l1_transaction: {level: {_eq: ${level}}}}},
          {deposit: {l2_transaction: {level: {_eq: ${level}}}}},
          {withdrawal: {l1_transaction: {level: {_eq: ${level}}}}},
          {withdrawal: {l2_transaction: {level: {_eq: ${level}}}}}
        ]
      `);
    }

    if (since) andConditions.push(`created_at: {_gte: "${since}"}`);

    if (before) andConditions.push(`created_at: {_lte: "${before}"}`);

    if (tokenSymbol) {
      andConditions.push(`_or: [
        {deposit: {l2_transaction: {ticket: {token: {symbol: {_ilike: "${tokenSymbol}"}}}}}},
        {deposit: {l2_transaction: {l2_token: {symbol: {_ilike: "${tokenSymbol}"}}}}},
        {withdrawal: {l2_transaction: {ticket: {token: {symbol: {_ilike: "${tokenSymbol}"}}}}}},
        {withdrawal: {l2_transaction: {l2_token: {symbol: {_ilike: "${tokenSymbol}"}}}}}
      ]`);
    }

    if (isFastWithdrawal !== undefined) {
      if (isFastWithdrawal) {
        andConditions.push(`kind: {_in: ["fast_withdrawal_service_provider", "fast_withdrawal_payed_out"]}`);
      } else {
        andConditions.push(`_or: [
          {kind: {_is_null: true}},
          {kind: {_nin: ["fast_withdrawal_service_provider", "fast_withdrawal_payed_out"]}}
        ]`);
      }
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
          order_by: {created_at: desc}
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
              ticket {
                token {
                  decimals
                  name
                  symbol
                }
              }
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

  resetStore = () => {
    this.transactionMap.clear();
    this._transactions.replace([]);
    this.currentPage = 1;
    this.error = null;
  };

  setLoadingState = (state: 'idle' | 'initial' | 'page' | 'refresh') => {
    this.loadingState = state;
  };

  goToPage = (page: number) => {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.setPage(page);
  };

  fetchBridgeOperations = async (filters: QueryFilters = {}): Promise<GraphQLResponse[]> => {
    const query: string = this.buildGraphQLQuery(filters);

    const response: { 
      data: { bridge_operation: GraphQLResponse[] };
      errors?: Array<{ message: string }>;
    } = await fetchJson(this.graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
      
    if (response.errors?.length) throw new Error(response.errors[0]?.message || 'Failed to fetch transactions');

    return response.data.bridge_operation;
  }

  private mergeTransactions = (transactions: TezosTransaction[]): void => {
    if (this.transactionMap.size === 0) {
      transactions.forEach(tx => this.transactionMap.set(tx.input.id, tx));
    } else {
      transactions.forEach(tx => {
        const existing: TezosTransaction | undefined = this.transactionMap.get(tx.input.id);
        if (existing) {
          existing.update(tx);
        } else {
          this.transactionMap.set(tx.input.id, tx);
        }
      });
    }
    
    this.trimOldTransactions();
    this._transactions.replace(Array.from(this.transactionMap.values()));
  };

  private trimOldTransactions = (): void => {
    if (this.transactionMap.size <= this.MAX_TRANSACTIONS) return;
    
    const allTransactions: TezosTransaction[] = Array.from(this.transactionMap.values());
    const toRemove: TezosTransaction[] = allTransactions.slice(this.MAX_TRANSACTIONS);
    
    toRemove.forEach(tx => this.transactionMap.delete(tx.input.id));
  };

  // Handles linking of fast_withdrawal_payed_out txs to their fast_withdrawal_service_provider parents
  linkFastWithdrawalTxs = action((
    tx: TezosTransaction,
    transactionMap: Map<string, TezosTransaction>,
    currentBatch?: TezosTransaction[]
  ): boolean => {
    if (tx.kind !== "fast_withdrawal_payed_out") {
      return true;
    }

    const l2Hash: string = tx.l2TxHash;
    let serviceProvider: TezosTransaction | undefined;

    if (currentBatch) {
      serviceProvider = currentBatch.find(
        batchTx => batchTx?.kind === "fast_withdrawal_service_provider" && batchTx.l2TxHash === l2Hash
      );
    }

    if (!serviceProvider) {
      for (const existingTx of transactionMap.values()) {
        if (existingTx.kind === "fast_withdrawal_service_provider" && existingTx.l2TxHash === l2Hash) {
          serviceProvider = existingTx;
          break;
        }
      }
    }

    if (serviceProvider) {
      serviceProvider.update({ 
        fastWithdrawalPayOut: tx,
        status: tx.status, 
        destinationStatus: tx.status,
        completed: tx.completed,
        completedDate: tx.completed ? tx.completedDate : undefined,
        expectedDate: tx.completed ? undefined : serviceProvider.expectedDate,
        l1TxHash: tx.l1TxHash || serviceProvider.l1TxHash,
        l1Block: tx.l1Block || serviceProvider.l1Block,
        receivingAmount: tx.receivingAmount || serviceProvider.receivingAmount
      });
      return false;
    }

    return true;
  });
  
  getTransactions = async (options: GetTransactionsOptions = {}): Promise<void> => {
    this.setLoadingState(options.loadingMode || (options.autoRefresh ? 'refresh' : 'initial'));
    this.error = null;

    if (options.resetStore) {
      this.resetStore();
    }

    let filters: GetTransactionsOptions = options;
    if (options.autoRefresh && this.transactions.length > 0) {
      filters = { ...options, since: this.transactions[0]?.input.updated_at };
    }
    
    try {
      const operations: GraphQLResponse[] = await this.fetchBridgeOperations({ ...filters, limit: this.batchSize });
      const allTransactions: TezosTransaction<GraphQLResponse>[] = operations.map(item => this.createTransaction(item));
      
      const transactionsToAdd: TezosTransaction<GraphQLResponse>[] = allTransactions.filter(tx => 
        this.linkFastWithdrawalTxs(tx, this.transactionMap, allTransactions)
      );
      
      this.mergeTransactions(transactionsToAdd);
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions');
    } finally {
      this.setLoadingState('idle');
    }
  };

  createTransaction = (data: GraphQLResponse): TezosTransaction<GraphQLResponse> => {
    const isDeposit: boolean = data.type === 'deposit';
    const txData: GraphQLResponse['deposit'] | GraphQLResponse['withdrawal'] = isDeposit ? data.deposit : data.withdrawal;
    
    const l1AmountRaw: string = txData?.l1_transaction?.amount || '0';
    const l2AmountRaw: string = txData?.l2_transaction?.amount || '0';
    const l1Hash: string = txData?.l1_transaction?.operation_hash || '';
    const l2HashRaw: string = txData?.l2_transaction?.transaction_hash || '';
    const l2Hash: string = l2HashRaw && !l2HashRaw.startsWith('0x') ? `0x${l2HashRaw}` : l2HashRaw;
    
    const tokenMetadata = isDeposit 
      ? (txData as GraphQLResponse['deposit'])?.l1_transaction?.ticket?.token
      : (txData as GraphQLResponse['withdrawal'])?.l2_transaction?.ticket?.token;
    const symbol: string = tokenMetadata?.symbol || 'UNKNOWN';
    
    let l2Decimals: number;
    if (symbol === 'XTZ') {
      l2Decimals = txData?.l2_transaction?.l2_token?.decimals ?? 18;
    } else {
      l2Decimals = tokenMetadata?.decimals ?? 0;
    }
    
    const l1Decimals: number = tokenMetadata?.decimals ?? 0;
    
    
    const l1Amount: number = toDecimalValue(Number(l1AmountRaw), l1Decimals);
    const l2Amount: number = toDecimalValue(Number(l2AmountRaw), l2Decimals);
    
    const l1Block: number | undefined = txData?.l1_transaction?.level;
    
    const l2Block: number | undefined = txData?.l2_transaction?.level !== null && txData?.l2_transaction?.level !== undefined
      ? txData.l2_transaction.level
      : undefined;
    
    const isFastWithdrawal = data.kind === 'fast_withdrawal_service_provider' ||
                            data.kind === 'fast_withdrawal_payed_out';
    
    const submittedTime: number = new Date(data.created_at).getTime();
    let expectedTime: number;
    
    if (data.type === 'withdrawal' && !isFastWithdrawal) {
      expectedTime = submittedTime + (15 * 24 * 60 * 60 * 1000); // 15 days for regular withdrawal
    } else {
      expectedTime = submittedTime + (2 * 60 * 1000); // 2 minutes for fast withdrawal and deposit
    }
    
    const completedDate: number | undefined = data.is_completed ? new Date(data.updated_at).getTime() : undefined;
    const finalExpectedDate: number | undefined = data.is_completed ? undefined : expectedTime;
    
    const destinationStatus: GraphTokenStatus = (data.kind === 'fast_withdrawal_service_provider')
      ? GraphTokenStatus.Pending 
      : data.status;
    
    const transaction = new TezosTransaction({
      type: data.type,
      input: data,
      sendingAmount: isDeposit ? l1Amount.toString() : l2Amount.toString(),
      receivingAmount: isDeposit ? l2Amount.toString() : l1Amount.toString(),
      symbol: symbol,
      chainId: 0,
      expectedDate: finalExpectedDate,
      submittedDate: submittedTime,
      completedDate: completedDate,
      l1TxHash: l1Hash,
      l2TxHash: l2Hash,
      status: data.status,
      destinationStatus: destinationStatus,
      completed: data.is_completed,
      l1Block: l1Block,
      l2Block: l2Block,
      kind: data.kind,
      isFastWithdrawal: isFastWithdrawal,
    });

    return transaction;
  };
}

export const tezosTransactionStore = new TezosTransactionStore();