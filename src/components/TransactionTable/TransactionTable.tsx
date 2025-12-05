'use client';

import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
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
  const [showRefreshing, setShowRefreshing] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loadingRefresh) {
      setShowRefreshing(true);
    } else if (showRefreshing) {
      timer = setTimeout(() => setShowRefreshing(false), 500);
    }
    
    return () => clearTimeout(timer);
  }, [loadingRefresh, showRefreshing]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Transactions
          {showRefreshing && (
            <CircularProgress 
              size={18} 
              sx={{ 
                color: 'success.main',
                animation: 'fadeIn 0.2s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }} 
            />
          )}
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

