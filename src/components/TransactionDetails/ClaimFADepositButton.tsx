import { useEffect } from 'react';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { walletStore } from '@/stores/walletStore';
import { TezosTransaction, GraphQLResponse } from '@/stores/tezosTransactionStore';
import { useClaimFADeposit } from './useClaimFADeposit';

const BLOCK_EXPLORER_URL: string = process.env.NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL || 'https://explorer.etherlink.com';

export const ClaimFADepositButton = observer(() => {
  const transaction: TezosTransaction<GraphQLResponse> | null = transactionDetailsStore.selectedTransaction;
  if (!transaction) return null;
  
  const {
    isClaiming,
    isConnecting,
    error,
    txHash,
    handleConnectWallet,
    claimDeposit,
  } = useClaimFADeposit(transaction);

  const isWalletConnected: boolean = walletStore.isConnected;
  const connectedAddress: string | null = walletStore.connectedAddress;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (txHash) {
      toast.success('Deposit claimed successfully!');
    }
  }, [txHash]);
  
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
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Connected:
            </Typography>
            <Typography variant="body2">
              {connectedAddress}
            </Typography>
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

