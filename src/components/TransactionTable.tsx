'use client';

import { observer } from 'mobx-react-lite';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';

const TransactionTable = observer(() => {

  const transactions: TezosTransaction[] = tezosTransactionStore.allTransactions;

  return (
    <div>
      <h2>Transactions</h2>
      <table border={1}>
        <thead>
          <tr>
            <th>Txn Hash</th>
            <th>Type</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.length > 0 && transactions.map((transaction, i) => {      
            return (    
              <tr key={i}>
                <td>{transaction.txHash}</td>
                <td>{transaction.type}</td>
                <td>{transaction.status}</td>
                <td>{transaction.sendingAmount}</td>
              </tr> 
            )
          })}
        </tbody>
      </table>
      <p>Total transactions: {transactions.length}</p>
    </div>
  );
});

TransactionTable.displayName = 'TransactionTable';

export default TransactionTable;

