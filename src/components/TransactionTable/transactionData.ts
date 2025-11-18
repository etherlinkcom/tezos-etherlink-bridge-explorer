import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { formatEtherlinkValue, formatTimeAgo, formatAmount } from '@/utils/formatters';
import { validateInput, ValidationResult } from '@/utils/validation';
import { useRouter } from 'next/navigation';

type Router = ReturnType<typeof useRouter>;
export type TransactionData = {
  sourceHash: string;
  destHash: string;
  fromAccount: string;
  toAccount: string;
  typeLabel: string;
  formattedAmount: string;
  formattedTimeAgo: string;
};

export const getTransactionData = (transaction: TezosTransaction): TransactionData => {
  let sourceHash: string;
  let destHash: string;
  let fromAccount: string;
  let toAccount: string;
  let typeLabel: string;

  if (transaction.type === 'deposit') {
    sourceHash = transaction.l1TxHash;
    destHash = transaction.l2TxHash;
    fromAccount = transaction.input.l1_account || '-';
    toAccount = formatEtherlinkValue(transaction.input.l2_account);
    typeLabel = 'Deposit';
  } else {
    sourceHash = transaction.l2TxHash;
    destHash = transaction.l1TxHash;
    fromAccount = formatEtherlinkValue(transaction.input.l2_account);
    toAccount = transaction.input.l1_account || '-';
    typeLabel = 'Withdrawal';
  }
  const formattedAmount = formatAmount(transaction.sendingAmount, transaction.symbol);
  const formattedTimeAgo = formatTimeAgo(new Date(transaction.submittedDate));

  return {
    sourceHash,
    destHash,
    fromAccount,
    toAccount,
    typeLabel,
    formattedAmount,
    formattedTimeAgo,
  };
};

export const createTransactionClickHandler = (router: Router) => {
  return (hash: string) => {
    const validation: ValidationResult = validateInput(hash);
    if (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash') {
      router.push(`/transaction/${hash}`);
    }
  };
};

