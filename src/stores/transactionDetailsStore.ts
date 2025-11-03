import { makeAutoObservable } from "mobx";
import { TezosTransaction, tezosTransactionStore } from "./tezosTransactionStore";
import { GraphQLResponse } from "./tezosTransactionStore";
import { formatDateTime, formatEtherlinkValue } from '@/utils/formatters';

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

  private validateTransaction(transaction: TezosTransaction<GraphQLResponse>): string | null {
    if (!transaction) {
      return 'Transaction data is null or undefined';
    }

    if (!transaction.type || !['deposit', 'withdrawal'].includes(transaction.type)) {
      return 'Invalid transaction type';
    }

    return null;
  }

  get formattedTransactionDetails() {
    if (!this.selectedTransaction) return null;

    const tx = this.selectedTransaction;
    const isDeposit = tx.type === 'deposit';
    const validationError = this.validateTransaction(tx);

    const formatValue = (value: string | undefined, isEtherlink: boolean): string | undefined => {
      if (!value) return undefined;
      return isEtherlink ? formatEtherlinkValue(value) : value;
    };
    
    const toBlockString = (level?: number) => (level !== undefined && level !== null ? String(level) : '-');

    const l1 = {
      network: 'Tezos',
      hash: formatValue(tx.l1TxHash, false),
      address: formatValue(tx.input?.l1_account, false),
      block: toBlockString(tx.l1Block),
      amount: isDeposit ? tx.sendingAmount : tx.receivingAmount
    };

    const l2 = {
      network: 'Etherlink',
      hash: formatValue(tx.l2TxHash, true),
      address: formatValue(tx.input?.l2_account, true),
      block: toBlockString(tx.l2Block),
      amount: isDeposit ? tx.receivingAmount : tx.sendingAmount
    };

    return {
      validation: { error: validationError },
      isDeposit,
      type: isDeposit ? 'Deposit' : 'Withdrawal',
      symbol: tx.symbol || 'Unknown',
      source: isDeposit ? l1 : l2,
      destination: isDeposit ? l2 : l1,
      status: tx.status || 'Unknown',
      networkFlow: `${isDeposit ? 'Tezos' : 'Etherlink'} → ${isDeposit ? 'Etherlink' : 'Tezos'}`,
      createdAt: tx.submittedDate ? formatDateTime(new Date(tx.submittedDate)) : 'Unknown',
      expectedAt: tx.expectedDate ? formatDateTime(new Date(tx.expectedDate)) : null,
      kind: tx.kind ? tx.kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null,
      fastWithdrawal: tx.fastWithdrawalPayOut
        ? {
            hash: formatValue(tx.fastWithdrawalPayOut.l1TxHash, false),
            address: formatValue(tx.fastWithdrawalPayOut.input?.l1_account, false),
            amount: `${tx.fastWithdrawalPayOut.receivingAmount || '0'} ${tx.fastWithdrawalPayOut.symbol || 'Unknown'}`,
            block: String(tx.fastWithdrawalPayOut.l1Block || tx.fastWithdrawalPayOut.l2Block || 'Not available'),
            date: tx.fastWithdrawalPayOut.submittedDate
              ? formatDateTime(new Date(tx.fastWithdrawalPayOut.submittedDate))
              : 'Not available',
          }
        : null,
    };
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