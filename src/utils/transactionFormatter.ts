import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { formatEtherlinkValue, formatDateTime } from './formatters';
import { validateTransaction } from './validation';


export interface TransactionField {
  label: string;
  value: string;
  type?: 'status';
  copyable?: boolean;
  monospace?: boolean;
  bold?: boolean;
  tooltip?: string;
}

export interface TransactionSection {
  title: string;
  description?: string;
  fields: TransactionField[];
}

const field = {
  hash: (label: string, value?: string, tooltip?: string, isEtherlink?: boolean): TransactionField => ({
    label,
    value: value ? (isEtherlink ? formatEtherlinkValue(value) : value) : 'Not available',
    copyable: !!value,
    monospace: true,
    tooltip: tooltip
  }),
  
  address: (label: string, value?: string, tooltip?: string, isEtherlink?: boolean): TransactionField => ({
    label,
    value: value ? (isEtherlink ? formatEtherlinkValue(value) : value) : 'Not available',
    copyable: !!value,
    monospace: true,
    tooltip: tooltip
  }),
  
  status: (label: string, value: string): TransactionField => ({
    label,
    value: value || 'Unknown',
    type: 'status',
  }),
  
  text: (label: string, value: string, bold?: boolean, tooltip?: string): TransactionField => ({
    label,
    value,
    bold,
    tooltip
  })
};

export const formatTransactionData = (tx: TezosTransaction | null) => {
  if (!tx) {
    return {
      sections: [],
      validation: { isValid: false, errors: ['Transaction not found'] }
    };
  }

  const isDeposit: boolean = tx.type === 'deposit';
  const sourceNet: string = isDeposit ? 'Tezos' : 'Etherlink';
  const destNet: string = isDeposit ? 'Etherlink' : 'Tezos';
  
  const validation = validateTransaction(tx);
  
  const generalInfo = { 
    type: isDeposit ? 'Deposit' : 'Withdrawal',
    amount: tx.sendingAmount || '0',
    symbol: tx.symbol || 'Unknown',
    status: tx.status || 'Unknown',
    createdAt: tx.submittedDate ? formatDateTime(new Date(tx.submittedDate)) : 'Unknown',
    network: `${sourceNet} → ${destNet}`
  };

  // TODO: if separate L1/L2 statuses are available, we can use those
  // TODO: Fix l1/l2 and payout tx amount 
  const sourceStatus: string = tx.status || 'UNKNOWN';
  const destinationStatus: string = tx.status || 'UNKNOWN';

  const sections: TransactionSection[] = [
    {
      title: `Source: ${sourceNet}`,
      fields: [
        field.hash('Transaction Hash', isDeposit ? tx.l1TxHash : tx.l2TxHash, undefined, !isDeposit),
        field.address('Address', isDeposit ? tx.input?.l1_account : tx.input?.l2_account, undefined, !isDeposit),
        field.status('Status', sourceStatus),
        field.text('Amount', `${tx.sendingAmount || '0'} ${tx.symbol || 'Unknown'}`, true)
      ]
    },
    {
      title: `Destination: ${destNet}`,
      fields: [
        field.hash('Transaction Hash', isDeposit ? tx.l2TxHash : tx.l1TxHash, undefined, isDeposit),
        field.address('Address', isDeposit ? tx.input?.l2_account : tx.input?.l1_account, undefined, isDeposit),
        field.status('Status', destinationStatus),
        field.text('Amount', `${tx.sendingAmount || '0'} ${tx.symbol || 'Unknown'}`, true)
      ]
    },
    {
      title: 'General Information',
      fields: [
        field.text('Transaction Type', generalInfo.type, true),
        ...(tx.kind ? [field.text('Transaction Kind', tx.kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))] : []),
        field.text('Network Flow', generalInfo.network),
        {
          label: 'Created',
          value: tx.submittedDate ? formatDateTime(new Date(tx.submittedDate)) : 'Unknown',
          tooltip: 'When the transaction was created'
        },
        ...(tx.expectedDate ? [{
          label: 'Expected',
          value: formatDateTime(new Date(tx.expectedDate)),
          tooltip: 'Expected completion time'
        }] : [])
      ]
    }
  ];

  // Add fast withdrawal section if applicable
  const fastWithdrawal: TezosTransaction | undefined = tx.fastWithdrawalPayOut;
  if (!isDeposit && fastWithdrawal) {
    sections.push({
      title: 'Fast Withdrawal Information',
      description: 'Details about the fast withdrawal service',
      fields: [
        field.hash('Payout Transaction Hash', fastWithdrawal.l1TxHash || 'Not available'),
        field.address('Payout Address', fastWithdrawal.input?.l1_account || 'Not available'),
        field.status('Payout Status', fastWithdrawal.status || 'Pending'),
        field.text('Payout Amount', `${fastWithdrawal.sendingAmount || '0'} ${fastWithdrawal.symbol || tx.symbol || 'Unknown'}`, true),
        field.text('Payout Block', String(fastWithdrawal.l1Block || fastWithdrawal.l2Block || 'Not available')),
        field.text('Payout Date', fastWithdrawal.submittedDate ? formatDateTime(new Date(fastWithdrawal.submittedDate)) : 'Not available')
      ]
    });
  }

  return {
    sections,
    validation
  };
};
