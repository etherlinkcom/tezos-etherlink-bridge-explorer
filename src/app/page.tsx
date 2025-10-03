'use client';

import { useEffect } from "react";
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";
import TransactionTable from "@/components/TransactionTable";

export default function Home() {
  // Make store available in browser console for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).store = tezosTransactionStore;
      console.log('Store is now available! Type "store" in console to test it.');
    }
    
    // Fetch transactions on page load
    tezosTransactionStore.fetchTransactions();
  }, []);
  
  return (
    <div>
      <h1>Tezos-Etherlink Bridge Explorer</h1>
      <TransactionTable />
    </div>
  );
}
