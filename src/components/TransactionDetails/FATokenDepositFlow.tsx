import { useEffect } from 'react';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { walletStore } from '@/stores/walletStore';
import { TezosTransaction, GraphQLResponse } from '@/stores/tezosTransactionStore';
import { useClaimFADeposit } from './useClaimFATokenDeposit';
import { DiscordSupportSteps, DiscordSupportButton } from '@/components/TransactionDetails/DiscordSupport';

const BLOCK_EXPLORER_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

export const FATokenDepositFlow = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  if (!transaction) return null;
  
  const {
    isClaiming,
    isConnecting,
    error,
    txHash,
    needsSupport,
    handleConnectWallet,
    claimDeposit,
  } = useClaimFADeposit(transaction);

  const isWalletConnected: boolean = walletStore.isConnected;
  const connectedAddress: string | null = walletStore.connectedAddress;

  
  useEffect(() => {
    if (txHash) toast.success('Deposit claimed successfully!');
  }, [txHash]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (needsSupport) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {error || 'Unable to process your request. Please contact support.'}
          What to do:
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
          <DiscordSupportSteps />
        </Box>
        <DiscordSupportButton />
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Claim your FA token deposit using the button below.
      </Typography>
      {!isWalletConnected ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectWallet}
          disabled={isConnecting}
          startIcon={isConnecting ? <CircularProgress size={20} /> : null}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { sm: 1 }, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">Connected:</Typography>
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {connectedAddress}
              </Typography>
            </Box>
            <Button variant="text" size="small" onClick={() => walletStore.disconnect()} sx={{ ml: { xs: 'auto', sm: 'auto' }, flexShrink: 0 }}>
              Disconnect
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={claimDeposit}
            disabled={isClaiming}
            startIcon={isClaiming ? <CircularProgress size={20} /> : null}
          >
            {isClaiming ? 'Claiming...' : 'Claim FA Token Deposit'}
          </Button>
          {txHash && (
            <Box sx={{ mt: 2 }}>
              <Link
                href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '0.875rem' }}
              >
                View transaction on explorer
              </Link>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

