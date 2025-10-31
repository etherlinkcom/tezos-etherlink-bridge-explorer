import { makeAutoObservable } from "mobx";
import { TezosTransaction, tezosTransactionStore } from "./tezosTransactionStore";
import { GraphQLResponse } from "./tezosTransactionStore";

export class TransactionDetailsStore {
  selectedTransaction: TezosTransaction | null = null;
  loadingState: 'idle' | 'loading' | 'error' = 'idle';
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get loading() { 
    return this.loadingState === 'loading'; 
  }

  get hasError() { 
    return this.loadingState === 'error'; 
  }

  get isIdle() { 
    return this.loadingState === 'idle'; 
  }

  private handleError(error: unknown, context: string) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in ${context}:`, error);
    this.error = `${context}: ${errorMessage}`;
    this.loadingState = 'error';
  }

  private async fetchOperationByHash(hash: string) {
    return await tezosTransactionStore.fetchBridgeOperations({ 
      txHash: hash,
      limit: 10
    });
  }

  async getTransactionDetails(hash: string): Promise<TezosTransaction | null> {
    this.loadingState = 'loading';
    this.error = null;

    try {
      const operations: GraphQLResponse[] | null = await this.fetchOperationByHash(hash);
      
      if (!operations || operations.length === 0) {
        this.handleError(new Error('Transaction not found'), 'Transaction by hash lookup');
        return null;
      }

      const transactions: TezosTransaction<GraphQLResponse>[] = operations.map(item => 
        tezosTransactionStore.createTransaction(item)
      );
      
      const tempTransactionMap = new Map<string, TezosTransaction>();
      const processedTransactions: TezosTransaction<GraphQLResponse>[] = transactions.filter(tx => 
        tezosTransactionStore.linkFastWithdrawalTxs(tx, tempTransactionMap, transactions)
      );
      
      const transaction = processedTransactions[0];
      
      if (!transaction) {
        this.handleError(new Error('Failed to process transaction'), 'Transaction processing');
        return null;
      }

      this.selectedTransaction = transaction;
      this.loadingState = 'idle';
      return transaction;

    } catch (error) {
      this.handleError(error, 'Failed to fetch transaction details');
      return null;
    }
  }

  clearSelectedTransaction() {
    this.selectedTransaction = null;
    this.loadingState = 'idle';
    this.error = null;
  }
}

export const transactionDetailsStore = new TransactionDetailsStore();

if (typeof window !== 'undefined') {
  (window as any).transactionDetailsStore = transactionDetailsStore;
}
