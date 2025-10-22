'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  CircularProgress,
  Chip,
  ChipProps,
  Tooltip
} from '@mui/material';
import { TezosTransaction, tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { EllipsisBox } from '@/components/shared/EllipsisBox';

export const TransactionTable = observer(() => {

  const transactions: TezosTransaction[] = tezosTransactionStore.currentTransactions;
  const loadingInitial = tezosTransactionStore.loadingInitial;
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

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          Transactions
        </Typography>
        {loadingRefresh && (
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Refreshing..." 
            color="success" 
            variant="outlined"
          />
        )}
      </Box>
      

      {/* Transaction Table */}
      <TableContainer component={Paper} className="table-card" sx={{ overflowX: 'auto' }}>
        <Table sx={{ 
          minWidth: 1200,
        }}>
          <TableHead>
            <TableRow sx={{ height: '48px' }}>
              <TableCell sx={{ width: '80px' }}>Status</TableCell>
              <TableCell sx={{ width: '140px' }}>Source Tx Hash</TableCell>
              <TableCell sx={{ width: '120px' }}>From</TableCell>
              <TableCell sx={{ width: '120px' }}>To</TableCell>
              <TableCell sx={{ width: '100px' }}>Amount</TableCell>
              <TableCell sx={{ width: '140px' }}>Destination Tx Hash</TableCell>
              <TableCell sx={{ width: '80px' }}>Type</TableCell>
              <TableCell sx={{ width: '100px' }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions && transactions.length > 0 && transactions.map((transaction) => (    
              <TableRow key={transaction.input.id || `${transaction.l1TxHash}-${transaction.l2TxHash}`} hover>
                {/* Status */}
                <TableCell>
                  <Chip 
                    label={transaction.status} 
                    size="small"
                    color={getStatusColor(transaction.status)}
                  />
                </TableCell>
                
                {/* Source Tx Hash */}
                <TableCell>
                  <Tooltip title={transaction.l1TxHash || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '120px'
                    }}>
                      {transaction.l1TxHash || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* From */}
                <TableCell>
                  <Tooltip title={transaction.input.l1_account || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '100px'
                    }}>
                      {transaction.input.l1_account || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* To */}
                <TableCell>
                  <Tooltip title={transaction.input.l2_account || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '100px'
                    }}>
                      {transaction.input.l2_account || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* Amount */}
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {transaction.sendingAmount} {transaction.symbol}
                  </Typography>
                </TableCell>
                
                {/* Destination Tx Hash */}
                <TableCell>
                  <Tooltip title={transaction.l2TxHash || '-'}>
                    <EllipsisBox sx={{ 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      maxWidth: '120px'
                    }}>
                      {transaction.l2TxHash || '-'}
                    </EllipsisBox>
                  </Tooltip>
                </TableCell>
                
                {/* Type */}
                <TableCell>
                  <Chip 
                    label={transaction.type} 
                    size="small" 
                    variant="outlined"
                    color={transaction.type === 'withdrawal' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                
                {/* Created */}
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {formatTimeAgo(new Date(transaction.submittedDate))}
                  </Typography>
                </TableCell>
              </TableRow> 
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Loading States */}
      {loadingInitial && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading transactions...
          </Typography>
        </Box>
      )}
      
      {!loadingInitial && transactions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found. Try adjusting your search criteria.
          </Typography>
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Total transactions on this page: {transactions.length}
      </Typography>
      
      {/* Pagination Controls (Bottom) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={handlePreviousPage}
            disabled={loadingPage || currentPage === 1}
            variant="outlined"
            startIcon={loadingPage && currentPage > 1 ? <CircularProgress size={16} /> : null}
          >
            {loadingPage && currentPage > 1 ? 'Loading...' : 'Previous'}
          </Button>
          <Button 
            onClick={handleNextPage}
            disabled={loadingPage || currentPage >= totalPages}
            variant="outlined"
            endIcon={loadingPage && currentPage < totalPages ? <CircularProgress size={16} /> : null}
          >
            {loadingPage && currentPage < totalPages ? 'Loading...' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});

