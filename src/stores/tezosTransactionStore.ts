import { makeAutoObservable } from "mobx";

type TransactionType = string;
type Confirmation = { txHash: string; chainId: number };
export type TezosTransactionType = "withdrawal" | "deposit";
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * TODO List:
 * fix kind field
 */
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
  // kind: null;
  deposit: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
    };
  };
  withdrawal: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
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
  confirmation: Confirmation | undefined;
  completed: boolean;
  status: GraphTokenStatus;
  explorerLink: string;
  isFastWithdrawal?: boolean;
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
  confirmation: Confirmation | undefined = undefined;
  completed = false;
  status: GraphTokenStatus;
  explorerLink: string;
  isFastWithdrawal?: boolean | undefined;

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
    this.explorerLink = props.explorerLink;
    this.isFastWithdrawal = props.isFastWithdrawal || false;
  }

  update(props: Partial<TransactionProps<Input>>) {
    Object.assign(this, props);
  }
}

export class TezosTransactionStore {
  transactions: TezosTransaction[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = "";
  offset: number = 0;
  hasMore: boolean = true;
  
  private readonly graphqlEndpoint = 'https://bridge.indexer.etherlink.com/v1/graphql';
  
  constructor() {
    makeAutoObservable(this);
  }
/**
 * TODO List:
 * change to search by address, block, hash, ..
 * add retrying (tanstack(?)), cache(?)
 * using mobx caching, retrying, error (check this) 1hr
*/
  get filteredTransactions() {
    if (!this.searchTerm) return this.transactions;

    const searchLower = this.searchTerm.toLowerCase();
    return this.transactions.filter(
      (transaction) =>
        transaction.txHash.toLowerCase().includes(searchLower) ||
        transaction.input.l1_account.toLowerCase().includes(searchLower) ||
        transaction.input.l2_account.toLowerCase().includes(searchLower) ||
        transaction.symbol.toLowerCase().includes(searchLower)
    );
  }

  get allTransactions(): TezosTransaction[] {
    return this.transactions;
  }

  get pendingTransactions() {
    return this.filteredTransactions.filter((tx) => !tx.completed);
  }

  get completedTransactions() {
    return this.filteredTransactions.filter((tx) => tx.completed);
  }
  /**
   * TODO List:
   * Add builder function
   * Build Query based on input eg tz address, etherlink address, block, hash, ..
   */
  setSearchTerm = (term: string) => {
    this.searchTerm = term;

    // if (i)
  };

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  setError = (error: string | null) => {
    this.error = error;
  };

  /**
   * TODO List:
   * - [ ] add retry max retry 5
   * - [ ] add pagination
   */
  fetchTransactions = async (limit: number = 50) => {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetTransactions($limit: Int, $offset: Int) {
              bridge_operation(
                limit: $limit,
                offset: $offset,
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
                deposit {
                  l2_transaction {
                    token_id
                    amount
                    transaction_hash
                    l2_token {
                      decimals
                      name
                      symbol
                    }
                  }
                  l1_transaction {
                    amount
                    operation_hash
                  }
                }
                withdrawal {
                  l2_transaction {
                    token_id
                    amount
                    transaction_hash
                    l2_token {
                      decimals
                      name
                      symbol
                    }
                  }
                  l1_transaction {
                    amount
                    operation_hash
                  }
                }
              }
            }
          `,
          variables: { 
            limit: limit,
            offset: this.offset 
          }
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const newTransactions = data.data.bridge_operation
        .map((item: GraphQLResponse) => this.createTransaction(item));
      
      this.transactions.push(...newTransactions);
      this.offset += limit;
      this.hasMore = newTransactions.length === limit;
      
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      this.setLoading(false);
    }
  };

  loadMore = async () => {
    if (this.loading || !this.hasMore) {
      return;
    }
    
    await this.fetchTransactions();
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
      explorerLink: isDeposit
        ? `https://tzkt.io/${l1Hash || data.id}`
        : `https://explorer.etherlink.com/tx/${l2Hash || data.id}`,
    });
  };
  
}

export const tezosTransactionStore = new TezosTransactionStore();

if (typeof window !== 'undefined') {
  (window as any).store = tezosTransactionStore;
}
