'use client';

import { memo } from 'react';
import { TableRow, TableCell, Typography, Chip, Tooltip } from '@mui/material';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { StatusChip } from '@/components/shared/StatusChip';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { formatTimeAgo, formatAmount } from '@/utils/formatters';

interface TransactionTableRowProps {
  transaction: TezosTransaction;
  onTransactionClick: (hash: string) => void;
}

export const TransactionTableRow = memo<TransactionTableRowProps>(({ transaction, onTransactionClick }) => {
  const sourceHash: string | undefined = transaction.type === 'deposit' ? transaction.l1TxHash : transaction.l2TxHash;
  const destHash: string | undefined = transaction.type === 'deposit' ? transaction.l2TxHash : transaction.l1TxHash;
  const fromAccount: string | undefined = transaction.type === 'deposit' ? transaction.input.l1_account : transaction.input.l2_account;
  const toAccount: string | undefined = transaction.type === 'deposit' ? transaction.input.l2_account : transaction.input.l1_account;

  return (
    <TableRow key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`} hover>
    
      <TableCell>
        <StatusChip status={transaction.status} />
      </TableCell>
      
      <TableCell>
        <Tooltip title={sourceHash || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              cursor: sourceHash && sourceHash !== '-' ? 'pointer' : 'default', 
              maxWidth: '140px',
              '&:hover': sourceHash && sourceHash !== '-' ? {
                color: 'primary.main',
                textDecoration: 'underline'
              } : {}
            }}
            onClick={() => sourceHash && sourceHash !== '-' && onTransactionClick(sourceHash)}
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
              cursor: 'pointer', 
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
              cursor: 'pointer', 
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
              cursor: destHash && destHash !== '-' ? 'pointer' : 'default', 
              maxWidth: '140px',
              '&:hover': destHash && destHash !== '-' ? {
                color: 'primary.main',
                textDecoration: 'underline'
              } : {}
            }}
            onClick={() => destHash && destHash !== '-' && onTransactionClick(destHash)}
          >
            {destHash || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Chip 
          label={transaction.type.toUpperCase()} 
          size="small" 
          variant="filled"
          color={transaction.type === 'withdrawal' ? 'primary' : 'secondary'}
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
