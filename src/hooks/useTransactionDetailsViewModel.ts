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
  const toBlockString = (level?: number) => (level !== undefined && level !== null ? String(level) : '-');

  const l1 = {
    network: 'Tezos',
    hash: formatValue(tx.l1TxHash, false),
    address: formatValue((tx.input as any)?.l1_account, false),
    hasHash: !!tx.l1TxHash,
    hasAddress: !!(tx.input as any)?.l1_account,
    block: toBlockString(tx.l1Block),
    amount: isDeposit ? tx.sendingAmount : tx.receivingAmount,
    status: isDeposit ? tx.sourceStatus : tx.destinationStatus
  } as const;

  const l2 = {
    network: 'Etherlink',
    hash: formatValue(tx.l2TxHash, true),
    address: formatValue((tx.input as any)?.l2_account, true),
    hasHash: !!tx.l2TxHash,
    hasAddress: !!(tx.input as any)?.l2_account,
    block: toBlockString(tx.l2Block),
    amount: isDeposit ? tx.receivingAmount : tx.sendingAmount,
    status: isDeposit ? tx.destinationStatus : tx.sourceStatus
  } as const;

  const transactionModel = {
    validation,
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
          address: formatValue((tx.fastWithdrawalPayOut.input as any)?.l1_account, false),
          amount: `${tx.fastWithdrawalPayOut.receivingAmount || '0'} ${tx.fastWithdrawalPayOut.symbol || 'Unknown'}`,
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
