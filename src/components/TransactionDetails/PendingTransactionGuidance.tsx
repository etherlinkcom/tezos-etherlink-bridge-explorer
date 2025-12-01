import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { GraphQLResponse, TezosTransaction } from '@/stores/tezosTransactionStore';
import { FATokenDepositFlow } from './FATokenDepositFlow';
import { FastWithdrawalGuidance } from './FastWithdrawalGuidance';
import { DiscordSupportSteps, DiscordSupportButton } from '@/components/TransactionDetails/DiscordSupport';

export const PendingTransactionGuidance = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

  if (!transaction || !transactionDetails) return null;

  const isDeposit: boolean = transactionDetails.isDeposit;

  const headerSection: React.ReactNode = (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
        Your transaction has been pending for longer than expected.
      </Typography>
      {transactionDetails.expectedAt && (
        <Typography variant="body2" color="text.secondary">
          Expected completion: {transactionDetails.expectedAt}
        </Typography>
      )}
    </Box>
  );

  const guidanceTitle: React.ReactNode = (
    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
      What to do:
    </Typography>
  );

  // Fast withdrawal flow
  if (transaction.isFastWithdrawal || false) {
    return (
      <Box>
        {headerSection}
        <Box>
          {guidanceTitle}
          <FastWithdrawalGuidance />
        </Box>
      </Box>
    );
  }

  // FA token deposit flow
  if (isDeposit && transaction.symbol !== 'XTZ' && !!transaction?.input?.l2_account) {
    return (
      <Box>
        {headerSection}
        <Box>
          {guidanceTitle}
          <FATokenDepositFlow />
        </Box>
      </Box>
    );
  }

  // Standard withdrawal/deposit flow
  return (
    <Box>
      {headerSection}
      <Box>
        {guidanceTitle}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please reach out to our support team for assistance with your {isDeposit ? 'deposit' : 'withdrawal'}.
          </Typography>

          <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
            <DiscordSupportSteps />
          </Box>

          <DiscordSupportButton />
        </Box>
      </Box>
    </Box>
  );
});

