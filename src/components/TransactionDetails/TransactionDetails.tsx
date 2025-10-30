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
  const vm = useTransactionDetailsViewModel(selectedTransaction);

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

  if (!vm) {
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
          {!vm.validation.isValid && (
            <DataSection title="Data Validation Issues" showDivider>
              {vm.validation.errors.map((err, index) => (
                <DetailField key={index} label="Error" value={err} />
              ))}
            </DataSection>
          )}

          <NetworkSection
            title={`Source: ${vm.source.network}`}
            hash={vm.source.hash}
            hasHash={vm.source.hasHash}
            address={vm.source.address}
            hasAddress={vm.source.hasAddress}
            status={vm.status}
            amount={vm.amount}
          />

          <NetworkSection
            title={`Destination: ${vm.destination.network}`}
            hash={vm.destination.hash}
            hasHash={vm.destination.hasHash}
            address={vm.destination.address}
            hasAddress={vm.destination.hasAddress}
            status={vm.status}
            amount={vm.amount}
            showDivider
          />

          <GeneralInformationSection 
            type={vm.type}
            kind={vm.kind}
            networkFlow={vm.networkFlow}
            createdAt={vm.createdAt}
            expectedAt={vm.expectedAt}
          />

          {vm.fastWithdrawal && (
            <FastWithdrawalSection data={vm.fastWithdrawal} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
});