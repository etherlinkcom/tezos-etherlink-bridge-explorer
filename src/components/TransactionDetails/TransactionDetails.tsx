'use client';

import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { useTransactionDetailsViewModel } from '@/hooks/useTransactionDetailsViewModel';
import { DetailField } from './DetailField';
import { DataSection } from './DataSection';
import { NetworkSection } from './NetworkSection';
import { TransactionHeader } from './TransactionHeader';
import { FastWithdrawalSection } from './FastWithdrawalSection';
import { GeneralInformationSection } from './GeneralInformationSection';

export const TransactionDetails = observer(() => {
  const { selectedTransaction, loading, hasError, error } = transactionDetailsStore;
  const transactionDetails = useTransactionDetailsViewModel(selectedTransaction);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Loading transaction details...</Typography>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Typography color="error" sx={{ py: 4 }}>
        {error}
      </Typography>
    );
  }

  if (!transactionDetails) {
    return (
      <Typography sx={{ py: 4 }}>
        Transaction not found
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TransactionHeader />

      <Card>
        <CardContent sx={{ p: 3 }}>
          {!transactionDetails.validation.isValid && (
            <DataSection title="Data Validation Issues" showDivider>
              {transactionDetails.validation.errors.map((err, index) => (
                <DetailField key={index} label="Error" value={err} />
              ))}
            </DataSection>
          )}

          <NetworkSection
            title={`Source: ${transactionDetails.source.network}`}
            hash={transactionDetails.source.hash}
            hasHash={transactionDetails.source.hasHash}
            address={transactionDetails.source.address}
            hasAddress={transactionDetails.source.hasAddress}
            status={transactionDetails.source.status || 'Unknown'}
            amount={`${transactionDetails.source.amount || '0'} ${transactionDetails.symbol}`}
            block={transactionDetails.source.block}
          />

          <NetworkSection
            title={`Destination: ${transactionDetails.destination.network}`}
            hash={transactionDetails.destination.hash}
            hasHash={transactionDetails.destination.hasHash}
            address={transactionDetails.destination.address}
            hasAddress={transactionDetails.destination.hasAddress}
            status={transactionDetails.destination.status || 'Unknown'}
            amount={`${transactionDetails.destination.amount || '0'} ${transactionDetails.symbol}`}
            block={transactionDetails.destination.block}
            showDivider
          />

          <GeneralInformationSection 
            type={transactionDetails.type}
            kind={transactionDetails.kind}
            networkFlow={transactionDetails.networkFlow}
            createdAt={transactionDetails.createdAt}
            expectedAt={transactionDetails.expectedAt}
          />

          {transactionDetails.fastWithdrawal && (
            <FastWithdrawalSection data={transactionDetails.fastWithdrawal} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
});