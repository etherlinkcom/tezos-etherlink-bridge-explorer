'use client';

import { observer } from 'mobx-react-lite';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';

const TransactionTable = observer(() => {

  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial = tezosTransactionStore.loadingInitial;
  const loadingMore = tezosTransactionStore.loadingMore;
  const loadingRefresh = tezosTransactionStore.loadingRefresh;
  const loadingPage = tezosTransactionStore.loadingPage;
  const currentPage = tezosTransactionStore.currentPage;
  const totalPages = tezosTransactionStore.totalPages;

  const handlePreviousPage = () => {
    tezosTransactionStore.goToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    tezosTransactionStore.goToPage(currentPage + 1);
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
            <th>L1 Tx Hash</th>
            <th>L2 Tx Hash</th>
            <th>L1 Block</th>
            <th>L2 Block</th>
            <th>Type</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Kind</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.length > 0 && transactions.map((transaction, i) => {      
            return (    
              <tr key={i}>
                <td style={{ 
                  maxWidth: '150px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontSize: '12px'
                }}>
                  {transaction.l1TxHash || '-'}
                </td>
                <td style={{ 
                  maxWidth: '150px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontSize: '12px'
                }}>
                  {transaction.l2TxHash || '-'}
                </td>
                <td>{transaction.l1Block !== undefined ? transaction.l1Block : '-'}</td>
                <td>{transaction.l2Block !== undefined ? transaction.l2Block : '-'}</td>
                <td>{transaction.type}</td>
                <td>{transaction.status}</td>
                <td>{transaction.sendingAmount} {transaction.symbol}</td>
                <td>{transaction.kind || 'N/A'}</td>
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
      
      {!loadingInitial && transactions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#666' }}>
          <span>No transactions found. Try adjusting your search criteria.</span>
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
    </div>
  );
});

TransactionTable.displayName = 'TransactionTable';

export default TransactionTable;

