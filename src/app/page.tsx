'use client';

import { useEffect } from "react";
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";
import TransactionTable from "@/components/TransactionTable";

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).store = tezosTransactionStore;
      console.log('Store is now available! Type "store" in console to test it.');
    }
    
    tezosTransactionStore.getTransactions();
    
    tezosTransactionStore.startAutoRefresh();
    
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
      <TransactionTable />
    </div>
  );
}
