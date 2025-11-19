import { Box, Typography, Link, Button } from '@mui/material';
import { Launch } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { GraphQLResponse, TezosTransaction } from '@/stores/tezosTransactionStore';

const DiscordSupportButton = () => (
  <Button
    variant="contained"
    color="primary"
    href="https://discord.gg/T6WnWB3dcr"
    target="_blank"
    rel="noopener noreferrer"
    component={Link}
    endIcon={<Launch />}
    sx={{ textDecoration: 'none' }}
  >
    Open Discord Support
  </Button>
);

const DiscordSupportSteps = (): React.ReactNode => (
  <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
    <Typography component="li" variant="body1">
      Join our Discord server using the button below
    </Typography>
    <Typography component="li" variant="body1">
      Navigate to the <Box component="strong">support channel</Box> and create a ticket
    </Typography>
    <Typography component="li" variant="body1">
      Provide your transaction hash and a description of the issue
    </Typography>
  </Box>
);

export const PendingTransactionGuidance = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

  if (!transaction || !transactionDetails) return null;

  const isDeposit: boolean = transactionDetails.isDeposit;
  const isFastWithdrawal: boolean = transaction.isFastWithdrawal || false;
  const isStandardFlow: boolean = !isFastWithdrawal

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
            <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
              <Typography component="li" variant="body1">
                Your fast withdrawal has exceeded the expected 5-minute completion time. 
                If you don't contact support within 24 hours,
                this would be executed as a normal withdrawal and take 15 days to complete.
              </Typography>
              <DiscordSupportSteps />
            </Box>
            <DiscordSupportButton />
          </Box>
        )}

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

