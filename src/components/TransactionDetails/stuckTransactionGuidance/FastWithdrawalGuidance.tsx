import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { TezosTransaction } from '@/stores/tezosTransactionStore';
import { GraphQLResponse } from '@/types/tezosTransaction';
import { DiscordSupportSteps, DiscordSupportButton } from './DiscordSupport';
import { triggerFastWithdrawalIncident, FastWithdrawalTransactionData } from '@/app/actions/pagerDuty';

export const FastWithdrawalGuidance = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  
  if (!transaction) return null;

  const handleFastWithdrawalDiscordClick = async (): Promise<void> => {
    if (transaction.l2TxHash) {
      const transactionData: FastWithdrawalTransactionData = {
        l2TxHash: transaction.l2TxHash,
        l1TxHash: transaction.l1TxHash,
        status: transaction.status,
        symbol: transaction.symbol,
        l2Block: transaction.l2Block,
        l1Block: transaction.l1Block,
        submittedDate: transaction.submittedDate,
      };
      triggerFastWithdrawalIncident(transactionData);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your fast withdrawal has exceeded the expected 5-minute completion time. 
        If you don&apos;t contact support within 24 hours,
        this would be executed as a normal withdrawal and take 15 days to complete.
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
        <DiscordSupportSteps />
      </Box>
      <DiscordSupportButton onClick={handleFastWithdrawalDiscordClick} />
    </Box>
  );
});
