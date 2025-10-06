'use client';

import { observer } from 'mobx-react-lite';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';

const TransactionTable = observer(() => {

  const transactions: TezosTransaction[] = tezosTransactionStore.transactions;
  const loadingInitial = tezosTransactionStore.loadingInitial;
  const loadingMore = tezosTransactionStore.loadingMore;
  const loadingRefresh = tezosTransactionStore.loadingRefresh;
  const loadingPage = tezosTransactionStore.loadingPage;
  const hasMore = tezosTransactionStore.hasMore;
  const currentPage = tezosTransactionStore.currentPage;
  const totalPages = tezosTransactionStore.totalPages;

  const handleLoadMore = () => {
    tezosTransactionStore.loadMore();
  };

  const handlePreviousPage = () => {
    tezosTransactionStore.previousPage();
  };

  const handleNextPage = () => {
    tezosTransactionStore.nextPage();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Transactions</h2>
        {loadingRefresh && (
          <span style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
            🔄 Refreshing...
          </span>
        )}
      </div>
      
      {/* Page-based Pagination Controls (Top) */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePreviousPage}
            disabled={loadingPage || currentPage === 1}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: loadingPage || currentPage === 1 ? 'not-allowed' : 'pointer',
              backgroundColor: loadingPage || currentPage === 1 ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loadingPage && currentPage > 1 ? 'Loading...' : 'Previous'}
          </button>
          <button 
            onClick={handleNextPage}
            disabled={loadingPage || currentPage >= totalPages}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: loadingPage || currentPage >= totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: loadingPage || currentPage >= totalPages ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loadingPage && currentPage < totalPages ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>

      <table border={1}>
        <thead>
          <tr>
            <th>Txn Hash</th>
            <th>L1 Block</th>
            <th>L2 Block</th>
            <th>Type</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.length > 0 && transactions.map((transaction, i) => {      
            return (    
              <tr key={i}>
                <td>{transaction.txHash}</td>
                <td>{transaction.l1Block !== undefined ? transaction.l1Block : '-'}</td>
                <td>{transaction.l2Block !== undefined ? transaction.l2Block : '-'}</td>
                <td>{transaction.type}</td>
                <td>{transaction.kind || 'N/A'}</td>
                <td>{transaction.status}</td>
                <td>{transaction.sendingAmount}</td>
              </tr> 
            )
          })}
        </tbody>
      </table>
      
      {loadingInitial && (
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
          <span>Loading transactions...</span>
        </div>
      )}
      
      <p>Total transactions on this page: {transactions.length}</p>
      
      {/* Page-based Pagination Controls (Bottom) */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePreviousPage}
            disabled={loadingPage || currentPage === 1}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: loadingPage || currentPage === 1 ? 'not-allowed' : 'pointer',
              backgroundColor: loadingPage || currentPage === 1 ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loadingPage && currentPage > 1 ? 'Loading...' : 'Previous'}
          </button>
          <button 
            onClick={handleNextPage}
            disabled={loadingPage || currentPage >= totalPages}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: loadingPage || currentPage >= totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: loadingPage || currentPage >= totalPages ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loadingPage && currentPage < totalPages ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
      
      {/* Load More button (Optional - for infinite scroll style) */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={handleLoadMore}
          disabled={loadingMore || !hasMore}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: loadingMore || !hasMore ? 'not-allowed' : 'pointer',
            backgroundColor: loadingMore || !hasMore ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loadingMore ? 'Loading More...' : hasMore ? 'Load More (Append to Current View)' : 'No More Transactions'}
        </button>
      </div>
    </div>
  );
});

TransactionTable.displayName = 'TransactionTable';

export default TransactionTable;

