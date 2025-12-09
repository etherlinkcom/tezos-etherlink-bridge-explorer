'use client';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { TableRow, TableCell, Typography, Chip, Tooltip, alpha, useTheme } from '@mui/material';
import ReactTimeAgo from 'react-timeago';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { StatusChip } from '@/components/shared/StatusChip';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { getTransactionData, createTransactionClickHandler, TransactionData } from './transactionData';
import { createFadeInHighlight } from '@/theme/animations';

export const TransactionTableRow = observer<{ transaction: TezosTransaction }>(({ transaction }) => {
  const isNew: boolean = tezosTransactionStore.newTransactionIds.has(transaction.input.id);
  const router = useRouter();
  const theme = useTheme();
  const transactionData: TransactionData = getTransactionData(transaction);
  const handleTransactionClick = createTransactionClickHandler(router);
  
  return (
    <TableRow 
      key={transaction.input.id} 
      hover
      onClick={() => (transactionData.sourceHash || transactionData.destHash) && handleTransactionClick(transactionData.sourceHash || transactionData.destHash)}
      sx={{ 
        cursor: 'pointer',
        ...(isNew && {
          backgroundColor: (theme) => alpha(theme.palette.success.main, 0.08),
          borderLeft: (theme) => `4px solid ${theme.palette.success.main}`,
          animation: `${createFadeInHighlight(theme)} 0.5s ease-in forwards`,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
          },
        }),
        transition: 'background-color 0.3s ease-out, border-left 0.3s ease-out',
      }}>
        
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
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', color: `inherit !important` }} component="div">
          <ReactTimeAgo date={new Date(transaction.submittedDate)} />
        </Typography>
      </TableCell>
    </TableRow>
  );
});

TransactionTableRow.displayName = 'TransactionTableRow';
