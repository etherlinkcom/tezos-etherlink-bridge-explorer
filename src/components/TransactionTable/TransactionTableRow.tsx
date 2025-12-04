'use client';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { TableRow, TableCell, Typography, Chip, Tooltip } from '@mui/material';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { StatusChip } from '@/components/shared/StatusChip';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { getTransactionData, createTransactionClickHandler, TransactionData } from './transactionData';

export const TransactionTableRow = observer<{ transaction: TezosTransaction }>(({ transaction }) => {
  const router = useRouter();
  const transactionData: TransactionData = getTransactionData(transaction);
  const handleTransactionClick = createTransactionClickHandler(router);
  
  return (
    <TableRow 
      key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`} 
      hover
      onClick={() => (transactionData.sourceHash || transactionData.destHash) && handleTransactionClick(transactionData.sourceHash || transactionData.destHash)}
      sx={{ cursor:'pointer' }}>
        
      <TableCell sx={{ width: '100px', maxWidth: '100px' }}>
        <StatusChip status={transaction.status} />
      </TableCell>
      
      <TableCell>
        <Tooltip title={transactionData.sourceHash || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '140px',
            }}
          >
            {transactionData.sourceHash || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>  

      <TableCell>
        <Tooltip title={transactionData.fromAccount || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '100px' 
            }}
          >
            {transactionData.fromAccount || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={transactionData.toAccount || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '100px' 
            }}
          >
            {transactionData.toAccount || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={`${transactionData.formattedAmount}`}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', color: `inherit !important` }}>
            {transactionData.formattedAmount}
          </Typography>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Tooltip title={transactionData.destHash || '-'}>
          <EllipsisBox 
            sx={{ 
              fontFamily: 'monospace', 
              maxWidth: '140px',
            }}
          >
            {transactionData.destHash || '-'}
          </EllipsisBox>
        </Tooltip>
      </TableCell>
      
      <TableCell>
        <Chip 
          label={transactionData.typeLabel} 
          size="small" 
          variant="filled"
        />
      </TableCell>
      
      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', color: `inherit !important` }}>
          {transactionData.formattedTimeAgo}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

TransactionTableRow.displayName = 'TransactionTableRow';
