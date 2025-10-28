'use client';

import { useEffect } from "react";
import { Box, Container } from '@mui/material';
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";
import { TransactionTable } from "@/components/TransactionTable";
import { SearchBox } from "@/components/SearchBox";
import { Layout } from "@/components/layouts/Layout";

export const dynamic = 'force-dynamic';

export default function Home() {
  useEffect(() => {
    const initializeStore = async () => {
      await tezosTransactionStore.getTransactions({ resetStore: true, loadingMode: 'initial' });
      tezosTransactionStore.startAutoRefresh();
    };

    initializeStore();
    
    return () => {
      tezosTransactionStore.stopAutoRefresh();
    };
  }, []);
  
  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SearchBox />
          <TransactionTable />
        </Box>
      </Container>
    </Layout>
  );
}
