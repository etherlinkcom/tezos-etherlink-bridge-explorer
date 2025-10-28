'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { StatusChip } from '@/components/shared/StatusChip';
import { Pagination } from '@/components/Pagination';
import { validateInput, ValidationResult } from '@/utils/validation';
import { formatTimeAgo } from '@/utils/formatters';

// TODO: add another componant for transaction table, pagination, 
export const TransactionTable = observer(() => {
  const router = useRouter();

  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial = tezosTransactionStore.loadingInitial;
  const loadingRefresh = tezosTransactionStore.loadingRefresh;

  const handleTransactionClick = (txHash: string) => {
    const validation: ValidationResult = validateInput(txHash);
    if (validation.isValid && (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash')) {
      router.push(`/transaction/${txHash}`);
    } else {
      console.warn('Invalid transaction hash:', txHash, validation.error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          Transactions
        </Typography>
        {loadingRefresh && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Refreshing..." 
            color="success" 
            variant="outlined"
          />
        )}
      </Box>
      

      {/* Transaction Table */}
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
            {transactions && transactions.length > 0 && transactions.map((transaction) => (    
              <TableRow key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`} hover>
                {/* Status */}
                <TableCell>
                  <StatusChip status={transaction.status} />
                </TableCell>
                
                {/* Source Tx Hash */}
                <TableCell>
                  <Tooltip title={transaction.l1TxHash || '-'}>
                    <EllipsisBox 
                      sx={{ 
                        fontFamily: 'monospace',
                        cursor: transaction.l1TxHash && transaction.l1TxHash !== '-' ? 'pointer' : 'default',
                        maxWidth: '120px',
                        '&:hover': transaction.l1TxHash && transaction.l1TxHash !== '-' ? {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        } : {}
                      }}
                      onClick={() => handleTransactionClick(transaction.l1TxHash)}
                    >
                      {transaction.l1TxHash || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* From */}
                <TableCell>
                  <Tooltip title={transaction.input.l1_account || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '100px'
                    }}>
                      {transaction.input.l1_account || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* To */}
                <TableCell>
                  <Tooltip title={transaction.input.l2_account || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '100px'
                    }}>
                      {transaction.input.l2_account || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* Amount */}
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {transaction.sendingAmount} {transaction.symbol}
                  </Typography>
                </TableCell>
                
                {/* Destination Tx Hash */}
                <TableCell>
                  <Tooltip title={transaction.l2TxHash || '-'}>
                    <EllipsisBox 
                      sx={{ 
                        fontFamily: 'monospace',
                        cursor: transaction.l2TxHash && transaction.l2TxHash !== '-' ? 'pointer' : 'default',
                        maxWidth: '120px',
                        '&:hover': transaction.l2TxHash && transaction.l2TxHash !== '-' ? {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        } : {}
                      }}
                      onClick={() => handleTransactionClick(transaction.l2TxHash)}
                    >
                      {transaction.l2TxHash || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* Type */}
                <TableCell>
                  <Chip 
                    label={transaction.type} 
                    size="small" 
                    variant="outlined"
                    color={transaction.type === 'withdrawal' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                
                {/* Created */}
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {formatTimeAgo(new Date(transaction.submittedDate))}
                  </Typography>
                </TableCell>
              </TableRow> 
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Loading States TODO: move above the table*/}
      {loadingInitial && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading transactions...
          </Typography>
        </Box>
      )}
      
      {!loadingInitial && transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found. Try adjusting your search criteria.
          </Typography>
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Total transactions on this page: {transactions.length}
      </Typography>
      
      {/* Pagination Controls (Bottom) */}
      <Pagination />
    </Box>
  );
});

