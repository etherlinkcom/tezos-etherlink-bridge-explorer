import { TezosTransaction } from './tezosTransactionStore';
import { action } from 'mobx';

/**
 * Handles linking of fast_withdrawal_payed_out txs to their fast_withdrawal_service_provider parents
 * Both share the same l2TxHash
 */
export class FastWithdrawalHandler {

  linkFastWithdrawalTxs = action((
    tx: TezosTransaction,
    transactionMap: Map<string, TezosTransaction>,
    currentBatch?: TezosTransaction[]
  ): boolean => {
    if (tx.kind !== "fast_withdrawal_payed_out") {
      return true;
    }

    const l2Hash = tx.l2TxHash;
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
        completed: tx.completed,
        l1TxHash: tx.l1TxHash || serviceProvider.l1TxHash,
        l1Block: tx.l1Block || serviceProvider.l1Block
      });
      return false;
    }

    return true;
  });

}
