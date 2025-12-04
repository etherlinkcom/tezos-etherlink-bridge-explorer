'use client';

import { useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { walletStore } from '@/stores/walletStore';
import { networkStore } from '@/stores/networkStore';
import { TezosTransaction, GraphQLResponse } from '@/stores/tezosTransactionStore';
import { useClaimFADeposit } from './useClaimFATokenDeposit';
import { DiscordSupportSteps, DiscordSupportButton } from './DiscordSupport';

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

  useEffect(() => {
    if (txHash) toast.success('Deposit claimed successfully!');
  }, [txHash]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (txHash) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your FA token deposit has been claimed successfully.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component="a"
          href={`${networkStore.config.blockExplorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction on explorer
        </Button>
      </Box>
    );
  }

  if (needsSupport) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Unable to process your request. Please contact support.
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2.5, '& > li': { mb: 1.5 } }}>
          <DiscordSupportSteps />
        </Box>
        <DiscordSupportButton />
      </Box>
    );
  }

  if (!isWalletConnected) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Connect your wallet to claim your FA token deposit.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectWallet}
          disabled={isConnecting}
          startIcon={isConnecting ? <CircularProgress size={20} /> : null}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Claim your FA token deposit using the button below.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={claimDeposit}
        disabled={isClaiming}
        startIcon={isClaiming ? <CircularProgress size={20} /> : null}
      >
        {isClaiming ? 'Claiming...' : 'Claim FA Token Deposit'}
      </Button>
    </Box>
  );
});

