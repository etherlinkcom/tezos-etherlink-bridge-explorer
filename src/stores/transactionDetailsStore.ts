import { makeAutoObservable, runInAction } from "mobx";
import { TezosTransaction, tezosTransactionStore } from "./tezosTransactionStore";
import { networkStore, NetworkType } from "./networkStore";
import { GraphQLResponse } from "@/types/tezosTransaction";
import { formatDateTime, formatEtherlinkValue } from '@/utils/formatters';
import { fetchWithdrawalL1ReceivedAmount, fetchMichelsonExitOpHash } from '@/utils/tzktVerification';
import { ExplorerInfo } from '@/utils/explorerInfo';

export class TransactionDetailsStore {
  selectedTransaction: TezosTransaction | null = null;
  loadingState: 'idle' | 'loading' | 'error' = 'idle';
  error: string | null = null;

  // L1 amount sourced from TzKT when the indexer didn't return one (see recoverMissingL1Amount)
  recoveredL1Amount: string | null = null;

  // Michelson L2 op hash for a michelson-alias withdrawal, sourced from TzKT
  // (see recoverMichelsonExitOp). The indexer only has the EVM-side hash.
  michelsonExitOpHash: string | null = null;

  // Search is network-scoped. When a hash isn't on the selected network, we probe
  // the others; if found, this names the network so the UI can offer a switch.
  searchedHash: string | null = null;
  foundOnNetwork: NetworkType | null = null;

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

  get isTransactionStuck(): boolean {
    if (!this.selectedTransaction) return false;
    
    const tx = this.selectedTransaction;
    
    if (tx.completed || tx.status === 'FINISHED' || tx.status === 'FAILED') return false;
    if (tx.expectedDate) return Date.now() > tx.expectedDate;
    
    return false;
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
    
    const toBlockString = (level?: number) => (level !== undefined && level !== null ? String(level) : undefined);

    // For withdrawals the L1 amount is the value received on Tezos. When the
    // indexer didn't return one, fall back to the value sourced from TzKT.
    const l1Amount: string | undefined = isDeposit
      ? tx.sendingAmount
      : (this.recoveredL1Amount ?? tx.receivingAmount);

    const l1 = {
      network: 'Tezos',
      hash: formatValue(tx.l1TxHash, false),
      address: formatValue(tx.input?.l1_account, false),
      block: toBlockString(tx.l1Block),
      amount: l1Amount,
      hashExplorer: undefined as ExplorerInfo | undefined,
      addressExplorer: undefined as ExplorerInfo | undefined,
    };

    // Dual-runtime (previewnet) L2 side: label the runtime, show the
    // runtime-correct address, and link Michelson hashes/addresses to the
    // Michelson explorer (shape-based routing would send them to L1 TzKT).
    const runtime: 'evm' | 'michelson' | undefined = tx.l2Runtime;
    const isMichelson: boolean = runtime === 'michelson';
    const meta = tx.input?.l2_account_meta;
    const michelsonExplorer: string | undefined = networkStore.config.michelsonExplorerUrl;

    const l2Address: string | undefined = isMichelson
      ? (meta?.origin ?? tx.input?.l2_account)        // the tz1 (alias scalar is the EVM hex)
      : formatValue(tx.input?.l2_account, true);      // 0x + hex

    const l2Hash: string | undefined = isMichelson
      ? (tx.l2TxHash || undefined)                    // Tezos op hash, unprefixed
      : formatValue(tx.l2TxHash, true);

    // Michelson hash link: deposits carry the Tezos op hash directly; alias
    // withdrawals run on EVM, so the op is resolved from TzKT (michelsonExitOpHash).
    const michelsonOpHash: string | undefined = isMichelson
      ? (isDeposit ? tx.l2TxHash : (this.michelsonExitOpHash ?? undefined))
      : undefined;
    const toMichelsonLink = (id: string | undefined): ExplorerInfo | undefined =>
      isMichelson && michelsonExplorer && id
        ? { url: `${michelsonExplorer}/${id}`, name: 'TzKT Explorer' }
        : undefined;

    const l2 = {
      network: runtime ? `Etherlink (${isMichelson ? 'Michelson' : 'EVM'})` : 'Etherlink',
      hash: l2Hash,
      address: l2Address,
      block: toBlockString(tx.l2Block),
      amount: isDeposit ? tx.receivingAmount : tx.sendingAmount,
      hashExplorer: toMichelsonLink(michelsonOpHash),
      addressExplorer: toMichelsonLink(l2Address),
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
            block: toBlockString(tx.fastWithdrawalPayOut.l1Block || tx.fastWithdrawalPayOut.l2Block),
            date: tx.fastWithdrawalPayOut.submittedDate
              ? formatDateTime(new Date(tx.fastWithdrawalPayOut.submittedDate))
              : 'Not available',
          }
        : null,
    };
  }

  private handleError(error: unknown, context: string) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
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
    this.recoveredL1Amount = null;
    this.michelsonExitOpHash = null;
    this.searchedHash = hash;
    this.foundOnNetwork = null;

    try {
      const operations: GraphQLResponse[] | null = await this.fetchOperationByHash(hash);
      
      if (!operations || operations.length === 0) {
        // Not on the selected network — probe the others so the UI can offer a switch.
        await this.probeOtherNetworks(hash);
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

      // If the indexer didn't return an L1 amount, source it from TzKT in the
      // background so the page renders immediately and updates reactively.
      void this.recoverMissingL1Amount(transaction);

      // Michelson-alias withdrawals only carry their EVM-side hash in the indexer;
      // resolve the Michelson op from TzKT in the background for the explorer link.
      void this.recoverMichelsonExitOp(transaction);

      return transaction;

    } catch (error) {
      this.handleError(error, 'Failed to fetch transaction details');
      return null;
    }
  }

  // Fallback for when the indexer doesn't return a regular withdrawal's L1
  // (Tezos) amount: source it from TzKT instead. Only acts when the indexer
  // amount is missing/zero, so a healthy indexer is never second-guessed.
  private async recoverMissingL1Amount(tx: TezosTransaction<GraphQLResponse>): Promise<void> {
    if (tx.type !== 'withdrawal' || !tx.l1TxHash) return;

    // Fast withdrawals carry their L1 amount on a separately-linked payout
    // record, so they're handled elsewhere and don't need recovery here.
    if (tx.isFastWithdrawal) return;

    // Indexer already returned an amount -> nothing to do.
    const indexerRaw: string | undefined = tx.input?.withdrawal?.l1_transaction?.amount;
    if (indexerRaw && indexerRaw !== '0') return;

    // Native XTZ is always mutez (6 dp); FA tokens use their own decimals.
    const isNativeXtz: boolean = tx.symbol === 'XTZ';
    const decimals: number = isNativeXtz
      ? 6
      : (tx.input?.withdrawal?.l2_transaction?.ticket?.token?.decimals ?? 6);

    const amount: string | null = await fetchWithdrawalL1ReceivedAmount(
      networkStore.config.tezosExplorerApiUrl,
      tx.l1TxHash,
      tx.input?.l1_account,
      isNativeXtz,
      decimals
    );
    if (amount === null) return;

    runInAction(() => {
      if (this.selectedTransaction?.input.id !== tx.input.id) return; // user navigated away
      this.recoveredL1Amount = amount;
    });
  }

  // Resolves the Michelson L2 op hash for a michelson-alias withdrawal from TzKT.
  // No-op for EVM ops, deposits (their L2 hash is already the Tezos op), or
  // networks without a Michelson interface.
  private async recoverMichelsonExitOp(tx: TezosTransaction<GraphQLResponse>): Promise<void> {
    if (tx.l2Runtime !== 'michelson' || tx.type !== 'withdrawal') return;

    const cfg = networkStore.config;
    if (!cfg.michelsonExplorerUrl || !cfg.gatewayContract) return;
    if (tx.l2Block == null) return;

    const hash: string | null = await fetchMichelsonExitOpHash(
      cfg.michelsonExplorerUrl,
      cfg.gatewayContract,
      tx.l2Block,
      tx.input?.withdrawal?.l2_transaction?.amount,
      tx.input?.l2_account_meta?.origin ?? tx.input?.l1_account
    );
    if (hash === null) return;

    runInAction(() => {
      if (this.selectedTransaction?.input.id !== tx.input.id) return; // user navigated away
      this.michelsonExitOpHash = hash;
    });
  }

  // Probes the non-selected networks for the hash. Stops at the first hit and
  // records it (a tx hash is unique to one chain). A bare existence query works
  // across both indexer schemas, so no per-network field handling is needed.
  private async probeOtherNetworks(hash: string): Promise<void> {
    const others: NetworkType[] = networkStore.networks.filter(n => n !== networkStore.currentNetwork);

    for (const network of others) {
      try {
        const ops = await tezosTransactionStore.fetchBridgeOperations(
          { txHash: hash, limit: 1 },
          networkStore.getConfig(network)
        );
        if (ops && ops.length > 0) {
          runInAction(() => {
            if (this.searchedHash !== hash) return; // a newer search superseded this one
            this.foundOnNetwork = network;
          });
          return;
        }
      } catch {
        // One network's indexer failing shouldn't stop us probing the rest.
      }
    }
  }

  // Switches to the network where the hash was found and re-runs the lookup, so
  // the detail page renders with that network's config (explorer URLs, etc.).
  switchToFoundNetwork = (): void => {
    const network: NetworkType | null = this.foundOnNetwork;
    const hash: string | null = this.searchedHash;
    if (!network || !hash) return;

    networkStore.setNetwork(network);
    this.foundOnNetwork = null;
    void this.getTransactionDetails(hash);
  };

  clearSelectedTransaction() {
    this.selectedTransaction = null;
    this.loadingState = 'idle';
    this.error = null;
    this.recoveredL1Amount = null;
    this.michelsonExitOpHash = null;
    this.searchedHash = null;
    this.foundOnNetwork = null;
  }
}

export const transactionDetailsStore = new TransactionDetailsStore();