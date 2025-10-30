import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { formatDateTime, formatEtherlinkValue } from '@/utils/formatters';
import { validateTransaction } from '@/utils/validation';

export const useTransactionDetailsViewModel = (tx: TezosTransaction | null) => {
  if (!tx) return null;

  const isDeposit = tx.type === 'deposit';
  const validation = validateTransaction(tx);

  const formatValue = (value: string | undefined, isEtherlink: boolean) => {
    if (!value) return 'Not available';
    return isEtherlink ? formatEtherlinkValue(value) : value;
  };

  const transactionModel = {
    validation,
    isDeposit,
    type: isDeposit ? 'Deposit' : 'Withdrawal',

    source: {
      network: isDeposit ? 'Tezos' : 'Etherlink',
      hash: formatValue(isDeposit ? tx.l1TxHash : tx.l2TxHash, !isDeposit),
      address: formatValue(isDeposit ? (tx.input as any)?.l1_account : (tx.input as any)?.l2_account, !isDeposit),
      hasHash: !!(isDeposit ? tx.l1TxHash : tx.l2TxHash),
      hasAddress: !!(isDeposit ? (tx.input as any)?.l1_account : (tx.input as any)?.l2_account),
    },

    destination: {
      network: isDeposit ? 'Etherlink' : 'Tezos',
      hash: formatValue(isDeposit ? tx.l2TxHash : tx.l1TxHash, isDeposit),
      address: formatValue(isDeposit ? (tx.input as any)?.l2_account : (tx.input as any)?.l1_account, isDeposit),
      hasHash: !!(isDeposit ? tx.l2TxHash : tx.l1TxHash),
      hasAddress: !!(isDeposit ? (tx.input as any)?.l2_account : (tx.input as any)?.l1_account),
    },

    amount: `${tx.sendingAmount || '0'} ${tx.symbol || 'Unknown'}`,
    status: tx.status || 'Unknown',
    networkFlow: `${isDeposit ? 'Tezos' : 'Etherlink'} → ${isDeposit ? 'Etherlink' : 'Tezos'}`,
    createdAt: tx.submittedDate ? formatDateTime(new Date(tx.submittedDate)) : 'Unknown',
    expectedAt: tx.expectedDate ? formatDateTime(new Date(tx.expectedDate)) : null,
    kind: tx.kind ? tx.kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null,

    fastWithdrawal: tx.fastWithdrawalPayOut
      ? {
          hash: formatValue(tx.fastWithdrawalPayOut.l1TxHash, false),
          address: formatValue((tx.fastWithdrawalPayOut.input as any)?.l1_account, false),
          status: tx.fastWithdrawalPayOut.status || 'Pending',
          amount: `${tx.fastWithdrawalPayOut.sendingAmount || '0'} ${tx.fastWithdrawalPayOut.symbol || tx.symbol || 'Unknown'}`,
          block: String(tx.fastWithdrawalPayOut.l1Block || tx.fastWithdrawalPayOut.l2Block || 'Not available'),
          date: tx.fastWithdrawalPayOut.submittedDate
            ? formatDateTime(new Date(tx.fastWithdrawalPayOut.submittedDate))
            : 'Not available',
          hasHash: !!tx.fastWithdrawalPayOut.l1TxHash,
          hasAddress: !!(tx.fastWithdrawalPayOut.input as any)?.l1_account,
        }
      : null,
  } as const;

  return transactionModel;
};
