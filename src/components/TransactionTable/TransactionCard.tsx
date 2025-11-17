'use client';

import { memo, useCallback } from 'react';
import { 
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { StatusChip } from '@/components/shared/StatusChip';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { getTransactionData, createTransactionClickHandler, TransactionData } from './transactionData';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';

const MonospaceField = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ flex: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <EllipsisBox 
      sx={{ 
        fontFamily: 'monospace', 
        fontSize: '0.875rem',
      }}
    >
      {value}
    </EllipsisBox>
  </Box>
);

export const TransactionCard = observer<{ transaction: TezosTransaction }>(({ transaction }) => {
  const router = useRouter();
  const transactionData: TransactionData = getTransactionData(transaction);
  const handleTransactionClick = createTransactionClickHandler(router);

  return (
    <Card
      onClick={() => handleTransactionClick(transactionData.sourceHash || transactionData.destHash)}
      sx={{
        cursor: 'pointer',
        mb: 2
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <StatusChip status={transaction.status} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {transactionData.typeLabel} 
            </Typography>
          </Stack>

          {/* From/To */}
            <MonospaceField label="From" value={transactionData.fromAccount} />
            <MonospaceField label="To" value={transactionData.toAccount} />
          {/* Amount */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Amount
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {transactionData.formattedAmount}
            </Typography>
          </Box>

          {/* Transaction Hash */}
          <MonospaceField label="Transaction Hash" value={transactionData.sourceHash || transactionData.destHash || '-'} />

          {/* Created Date - right aligned, no label */}
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {transactionData.formattedTimeAgo}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
});

TransactionCard.displayName = 'TransactionCard';
