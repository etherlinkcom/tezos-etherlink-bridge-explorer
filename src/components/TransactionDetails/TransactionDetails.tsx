'use client';

import { 
  Box, 
  Typography, 
  Card,
  CardContent
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { DetailField } from './DetailField';
import { DataSection } from './DataSection';
import { NetworkSection } from './NetworkSection';
import { TransactionHeader } from './TransactionHeader';
import { FastWithdrawalSection } from './FastWithdrawalSection';
import { GeneralInformationSection } from './GeneralInformationSection';

export const TransactionDetails = observer(() => {
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

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
          {transactionDetails.validation.error && (
            <DataSection title="Data Validation Issues" showDivider>
              <DetailField label="Error" value={transactionDetails.validation.error} />
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