'use server';

import { createPagerDutyIncident } from './createPagerDutyIncident';

export interface FastWithdrawalTransactionData {
  l2TxHash: string;
  l1TxHash?: string;
  status?: string;
  symbol?: string;
  l2Block?: number;
  l1Block?: number;
  submittedDate?: number;
}

export async function triggerFastWithdrawalIncident(transaction: FastWithdrawalTransactionData): Promise<void> {
  const l2TxHash: string = transaction.l2TxHash;
  
  const additionalDetails: Record<string, unknown> = {
    l2_transaction_hash: l2TxHash,
    l1_transaction_hash: transaction.l1TxHash,
    status: transaction.status,
    token_symbol: transaction.symbol,
    l2_block: transaction.l2Block,
    l1_block: transaction.l1Block,
    transaction_timestamp: transaction.submittedDate,
  };

  try {
    await createPagerDutyIncident(l2TxHash, additionalDetails);
  } catch (error: unknown) {
    console.error('Error in PagerDuty Server Action:', error);
  }
}

