'use client';

import { useEffect, use } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { TransactionDetails } from '@/components/TransactionDetails/TransactionDetails';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';

interface TransactionPageProps {
  params: Promise<{
    txHash: string;
  }>;
}

export default observer(function TransactionPage({ params }: TransactionPageProps) {

  const { txHash: transactionHash } = use(params);

  useEffect(() => {
    if (transactionHash) {
      transactionDetailsStore.getTransactionDetails(transactionHash);
    }

    return () => {
      transactionDetailsStore.clearSelectedTransaction();
    };
  }, [transactionHash]);

  const { loading, hasError, error } = transactionDetailsStore;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress size={24} />
            <Typography>Loading transaction details...</Typography>
          </Box>
        )}
        
        {hasError && (
          <Typography color="error" sx={{ py: 4 }}>
            {error}
          </Typography>
        )}
        
        {!loading && !hasError && <TransactionDetails />}
      </Container>
    </Box>
  );
});
