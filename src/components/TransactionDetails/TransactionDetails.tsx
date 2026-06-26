'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { networkStore } from '@/stores/networkStore';
import { DetailField } from './DetailField';
import { DataSection } from './DataSection';
import { NetworkSection } from './NetworkSection';
import { TransactionHeader } from './TransactionHeader';
import { FastWithdrawalSection } from './FastWithdrawalSection';
import { GeneralInformationSection } from './GeneralInformationSection';
import { PendingTransactionGuidance } from './stuckTransactionGuidance/PendingTransactionGuidance';

export const TransactionDetails = observer(() => {
  const { loading, hasError, error } = transactionDetailsStore;
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography>Loading transaction details...</Typography>
      </Box>
    );
  }

  if (hasError) {
    const foundOn = transactionDetailsStore.foundOnNetwork;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, py: 4 }}>
        <Typography color="error">{error}</Typography>
        {foundOn && (
          <Button variant="outlined" onClick={() => transactionDetailsStore.switchToFoundNetwork()}>
            Transaction found on {networkStore.getConfig(foundOn).networkName} — switch network
          </Button>
        )}
      </Box>
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
        <CardContent sx={{ p: 3, pt: 1.5}}>
          {transactionDetails.validation.error && (
            <DataSection title="Data Validation Issues" showDivider>
              <DetailField label="Error" value={transactionDetails.validation.error} />
            </DataSection>
          )}

          <NetworkSection
            title={`Source: ${transactionDetails.source.network}`}
            hash={transactionDetails.source.hash}
            address={transactionDetails.source.address}
            amount={`${transactionDetails.source.amount || '0'} ${transactionDetails.symbol}`}
            block={transactionDetails.source.block}
            hashExplorer={transactionDetails.source.hashExplorer}
            addressExplorer={transactionDetails.source.addressExplorer}
          />

          <NetworkSection
            title={`Destination: ${transactionDetails.destination.network}`}
            hash={transactionDetails.destination.hash}
            address={transactionDetails.destination.address}
            amount={`${transactionDetails.destination.amount || '0'} ${transactionDetails.symbol}`}
            block={transactionDetails.destination.block}
            hashExplorer={transactionDetails.destination.hashExplorer}
            addressExplorer={transactionDetails.destination.addressExplorer}
            showDivider
          />

          <GeneralInformationSection 
            status={transactionDetails.status}
            type={transactionDetails.type}
            kind={transactionDetails.kind}
            networkFlow={transactionDetails.networkFlow}
            createdAt={transactionDetails.createdAt}
            expectedAt={transactionDetails.expectedAt}
          />

          {transactionDetails.fastWithdrawal && (
            <FastWithdrawalSection data={transactionDetails.fastWithdrawal} />
          )}

          {transactionDetailsStore.isTransactionStuck && (
            <>
              <Divider sx={{ my: 3 }} />
              <PendingTransactionGuidance />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});