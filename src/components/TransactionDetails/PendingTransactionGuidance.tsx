import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { GraphQLResponse, TezosTransaction } from '@/stores/tezosTransactionStore';
import { FATokenDepositFlow } from './FATokenDepositFlow';
import { DiscordSupportSteps, DiscordSupportButton } from '@/components/TransactionDetails/DiscordSupport';

export const PendingTransactionGuidance = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

  if (!transaction || !transactionDetails) return null;

  const isDeposit: boolean = transactionDetails.isDeposit;
  const isFastWithdrawal: boolean = transaction.isFastWithdrawal || false;
  const receiverAddress: string | undefined = transaction?.input?.l2_account;
  const isFaTokenDepositClaimable: boolean = isDeposit && transaction.symbol !== 'XTZ' && !!receiverAddress;
  const isStandardFlow: boolean = !isFastWithdrawal && !isFaTokenDepositClaimable;

  return (
    <Box>
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

      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          What to do:
        </Typography>

        {/* Fast Withdrawal Actions */}
        {isFastWithdrawal && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your fast withdrawal has exceeded the expected 5-minute completion time. 
              If you don&apos;t contact support within 24 hours,
              this would be executed as a normal withdrawal and take 15 days to complete.
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
              <DiscordSupportSteps />
            </Box>
            <DiscordSupportButton />
          </Box>
        )}

        {/* FA Token Deposit Actions */}
        {isFaTokenDepositClaimable && <FATokenDepositFlow />}

        {/* Standard Withdrawal/Deposit Actions */}
        {isStandardFlow && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please reach out to our support team for assistance with your {isDeposit ? 'deposit' : 'withdrawal'}.
            </Typography>

            <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
              <DiscordSupportSteps />
            </Box>

            <DiscordSupportButton />
          </Box>
        )}
      </Box>
    </Box>
  );
});

