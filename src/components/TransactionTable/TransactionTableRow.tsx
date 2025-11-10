'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { TableRow, TableCell, Typography, Chip, Tooltip } from '@mui/material';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { StatusChip } from '@/components/shared/StatusChip';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { formatTimeAgo, formatAmount, formatEtherlinkValue } from '@/utils/formatters';
import { validateInput, ValidationResult } from '@/utils/validation';

export const TransactionTableRow = memo<{ transaction: TezosTransaction }>(({ transaction }) => {
  const router = useRouter();

  const handleTransactionClick = (hash: string) => {
    const validation: ValidationResult = validateInput(hash);
    if (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash') {
      router.push(`/transaction/${hash}`);
    }
  };
  const sourceHash: string | undefined = transaction.type === 'deposit' ? transaction.l1TxHash : transaction.l2TxHash;
  const destHash: string | undefined = transaction.type === 'deposit' ? transaction.l2TxHash : transaction.l1TxHash;

  const fromAccount: string = transaction.type === 'deposit' 
    ? (transaction.input.l1_account || '-')
    : formatEtherlinkValue(transaction.input.l2_account);
  const toAccount: string = transaction.type === 'deposit'
    ? formatEtherlinkValue(transaction.input.l2_account)
    : (transaction.input.l1_account || '-');
  
  return (
    <TableRow 
      key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`} 
      hover
      onClick={() => (sourceHash || destHash) && handleTransactionClick(sourceHash || destHash)}
      sx={{ cursor:'pointer' }}>
        
      <TableCell>
        <StatusChip status={transaction.status} />
      </TableCell>
      
      <TableCell>
        <Tooltip title={sourceHash || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '140px',
            }}
          >
            {sourceHash || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>  

      <TableCell>
        <Tooltip title={fromAccount || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '100px' 
            }}
          >
            {fromAccount || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={toAccount || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '100px' 
            }}
          >
            {toAccount || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={`${transaction.sendingAmount} ${transaction.symbol}`}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {formatAmount(transaction.sendingAmount, transaction.symbol)}
          </Typography>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={destHash || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '140px',
            }}
          >
            {destHash || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Chip 
          label={transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} 
          size="small" 
          variant="filled"
          color={transaction.type === 'withdrawal' ? 'primary' : 'default'}
        />
      </TableCell>
      
      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {formatTimeAgo(new Date(transaction.submittedDate))}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

TransactionTableRow.displayName = 'TransactionTableRow';
