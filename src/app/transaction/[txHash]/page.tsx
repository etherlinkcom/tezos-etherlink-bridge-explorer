'use client';

import { useEffect, use } from 'react';
import { Container, Box } from '@mui/material';
import { TransactionDetails } from '@/components/TransactionDetails/TransactionDetails';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';

interface TransactionPageProps {
  params: Promise<{
    txHash: string;
  }>;
}

export default function TransactionPage({ params }: TransactionPageProps) {

  const { txHash: transactionHash } = use(params);

  useEffect(() => {
    if (transactionHash) {
      transactionDetailsStore.getTransactionDetails(transactionHash);
    }

    return () => {
      transactionDetailsStore.clearSelectedTransaction();
    };
  }, [transactionHash]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <TransactionDetails />
      </Container>
    </Box>
  );
}
