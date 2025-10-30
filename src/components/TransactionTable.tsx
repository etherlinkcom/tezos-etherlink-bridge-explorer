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
  CircularProgress,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { TransactionTableRow } from '@/components/TransactionTableRow';
import { Pagination } from '@/components/Pagination';
import { validateInput, ValidationResult } from '@/utils/validation';

export const TransactionTable = observer(() => {
  const router = useRouter();

  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial: boolean = tezosTransactionStore.loadingInitial;
  const loadingRefresh: boolean = tezosTransactionStore.loadingRefresh;

  const handleTransactionClick = (txHash: string) => {
    const validation: ValidationResult = validateInput(txHash);
    if (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash') {
      router.push(`/transaction/${txHash}`);
    } else {
      console.warn('Invalid transaction hash:', txHash, validation.error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          Transactions
        </Typography>
      </Box>
      
      {loadingInitial && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading transactions...
          </Typography>
        </Box>
      )}
      
      {loadingRefresh && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Refreshing..." 
            color="success" 
            variant="outlined"
          />
        </Box>
      )}
      
      {!loadingInitial && transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found. Try adjusting your search criteria.
          </Typography>
        </Box>
      )}

      {!loadingInitial && transactions.length > 0 && (
        <>
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
                    onTransactionClick={handleTransactionClick}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total transactions on this page: {transactions.length}
          </Typography>
        </>
      )}
      
      <Pagination />
    </Box>
  );
});

