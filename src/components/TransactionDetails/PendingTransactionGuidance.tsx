import { Box, Typography, Link, Button, Alert } from '@mui/material';
import { Launch } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';

export const PendingTransactionGuidance = observer(() => {
  const transaction = transactionDetailsStore.selectedTransaction;
  const transactionDetails = transactionDetailsStore.formattedTransactionDetails;

  if (!transaction || !transactionDetails) return null;

  const isDeposit = transactionDetails.isDeposit;
  const isFastWithdrawal = transaction.isFastWithdrawal || false;
  const isFaTokenDeposit = isDeposit && transactionDetails.symbol !== 'XTZ';
  const isStandardFlow = !isFastWithdrawal && !isFaTokenDeposit;

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

  const discordSupportSteps = [
    <Typography key="discord-join" component="li" variant="body1">
      Join our Discord server using the button below
    </Typography>,
    <Typography key="discord-navigate" component="li" variant="body1">
      Navigate to the <Box component="strong">support channel</Box> and create a ticket
    </Typography>,
    <Typography key="discord-hash" component="li" variant="body1">
      Provide your transaction hash and a description of the issue
    </Typography>
  ];

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
                Your fast withdrawal has exceeded the expected 5-minute completion time. Please contact support within the next <Box component="span" fontWeight="bold">24 hours.</Box>
              </Typography>
              {discordSupportSteps}
            </Box>
            <Alert severity="warning" sx={{ mb: 2.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Time-sensitive action required
              </Typography>
              <Typography variant="body2">
                You must contact support within 24 hours of submission. After 24 hours, we won&apos;t be able to execute your withdrawal.
              </Typography>
            </Alert>
            <DiscordSupportButton />
          </Box>
        )}

        {/* FA Token Deposit Actions */}
        {isFaTokenDeposit && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You can claim your FA token deposit by calling the claim function.
            </Typography>
            {/* TODO: Add claim button*/}
            <Button 
              variant="contained" 
              color="primary"
              disabled
            >
              Claim FA Token Deposit
            </Button>
          </Box>
        )}

        {/* Standard Withdrawal/Deposit Actions */}
        {isStandardFlow && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please reach out to our support team for assistance with your {isDeposit ? 'deposit' : 'withdrawal'}.
            </Typography>

            <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
              {discordSupportSteps}
            </Box>

            <DiscordSupportButton />
          </Box>
        )}
      </Box>
    </Box>
  );
});

