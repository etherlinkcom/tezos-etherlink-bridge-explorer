'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { TransactionsTableContent } from '@/components/TransactionTable/TransactionsTableContent';
import { Pagination } from '@/components/Pagination';

export const TransactionTable = observer(() => {
  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial: boolean = tezosTransactionStore.loadingInitial;
  const loadingRefresh: boolean = tezosTransactionStore.loadingRefresh;  

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
          <TransactionsTableContent transactions={transactions} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total transactions on this page: {transactions.length}
          </Typography>
        </>
      )}
      
      <Pagination />
    </Box>
  );
});

