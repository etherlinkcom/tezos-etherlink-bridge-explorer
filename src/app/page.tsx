'use client';

import { useEffect } from "react";
import { observer } from 'mobx-react-lite';
import { Box, Container } from '@mui/material';
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";
import { filterStore } from "@/stores/filterStore";
import { networkStore } from "@/stores/networkStore";
import { TransactionTable } from "@/components/TransactionTable/TransactionTable";
import { SearchBox } from "@/components/SearchBox/SearchBox";
import { Layout } from "@/components/layouts/Layout";

export const dynamic = 'force-dynamic';

const Home = observer(() => {
  useEffect(() => {
    networkStore.initialize();
    
    const initializeStore = async () => {      
      await tezosTransactionStore.getTransactions({
        ...filterStore.currentFilters,
        resetStore: true,
        loadingMode: 'initial'
      });
      
      tezosTransactionStore.startAutoRefresh();
    };

    initializeStore();
    
    return () => {
      tezosTransactionStore.stopAutoRefresh();
    };
  }, [networkStore.currentNetwork]);
  
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
});

export default Home;
