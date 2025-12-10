'use client';

import { observer } from 'mobx-react-lite';
import { Box, Button, Typography } from '@mui/material';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';

export const Pagination = observer(() => {
  const currentPage: number = tezosTransactionStore.currentPage;
  const totalPages: number = tezosTransactionStore.totalPages;

  const handlePreviousPage = () => {
    tezosTransactionStore.goToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    tezosTransactionStore.goToPage(currentPage + 1);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
      <Button
        variant="outlined"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      <Typography variant="body2" color="text.secondary">
        Page {currentPage} of {totalPages}
      </Typography>
      
      <Button
        variant="outlined"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </Box>
  );
});
