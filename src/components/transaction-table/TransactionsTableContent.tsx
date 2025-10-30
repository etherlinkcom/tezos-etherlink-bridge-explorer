'use client';

import { memo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { TransactionTableRow } from '@/components/transaction-table/TransactionTableRow';

export const TransactionsTableContent = memo<{ transactions: TezosTransaction[] }>(({ transactions }) => {
  return (
    <TableContainer component={Paper} className="table-card" sx={{ overflowX: 'auto' }}>
      <Table sx={{
        minWidth: 1200,
      }}>
        <TableHead>
          <TableRow sx={{ height: '48px' }}>
            <TableCell sx={{ width: '80px' }}>Status</TableCell>
            <TableCell sx={{ width: '140px' }}>Source Tx Hash</TableCell>
            <TableCell sx={{ width: '120px' }}>From</TableCell>
            <TableCell sx={{ width: '120px' }}>To</TableCell>
            <TableCell sx={{ width: '100px' }}>Amount</TableCell>
            <TableCell sx={{ width: '140px' }}>Destination Tx Hash</TableCell>
            <TableCell sx={{ width: '80px' }}>Type</TableCell>
            <TableCell sx={{ width: '100px' }}>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionTableRow
              key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`}
              transaction={transaction}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

TransactionsTableContent.displayName = 'TransactionsTableContent';


