'use client';

import { useEffect } from "react";
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";
import TransactionTable from "@/components/TransactionTable";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).store = tezosTransactionStore;
      console.log('Store is now available! Type "store" in console to test it.');
    }

    const initializeStore = async () => {
      console.log('🚀 Starting initial load...');
      await tezosTransactionStore.getTransactions();
      console.log('✅ Initial load completed, starting auto-refresh...');
      tezosTransactionStore.startAutoRefresh();
    };

    initializeStore();
    
    return () => {
      tezosTransactionStore.stopAutoRefresh();
    };
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>Tezos-Etherlink Bridge Explorer</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Explore bridge transactions between Tezos (L1) and Etherlink (L2)
      </p>
      <SearchBar />
      <TransactionTable />
    </div>
  );
}
