'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Typography,
  CircularProgress,
} from '@mui/material';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { TransactionsTableContent } from '@/components/TransactionTable/TransactionsTableContent';
import { Pagination } from '@/components/Pagination';
import { TransactionCards } from './TransactionCards';

export const TransactionTable = observer(() => {
  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial: boolean = tezosTransactionStore.loadingInitial;
  const loadingRefresh: boolean = tezosTransactionStore.loadingRefresh;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, ml: { xs: 0.25, md: 1} }}>
        <Typography variant="h4" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Transactions
          <Box
            sx={{
              opacity: loadingRefresh ? 1 : 0,
              visibility: loadingRefresh ? 'visible' : 'hidden',
              display: 'inline-block',
              transition: loadingRefresh
                ? 'opacity 0s, visibility 0s'
                : 'opacity 0s 1s, visibility 0s 1s',
            }}
          >
            <CircularProgress 
              size={18} 
              sx={{ color: 'success.main' }} 
            />
          </Box>
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
      
      {!loadingInitial && transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found. Try adjusting your search criteria.
          </Typography>
        </Box>
      )}

      {!loadingInitial && transactions.length > 0 && (
        <>
          <TransactionsTableContent transactions={transactions} sx={{ display: { xs: 'none', lg: 'block' } }} />
          <TransactionCards transactions={transactions} sx={{ display: { xs: 'flex', lg: 'none' } }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total transactions on this page: {transactions.length}
          </Typography>
        </>
      )}
      
      <Pagination />
    </Box>
  );
});

