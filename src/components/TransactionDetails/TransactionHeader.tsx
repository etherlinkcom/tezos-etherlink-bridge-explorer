import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export const TransactionHeader = () => {
  const router = useRouter();
  const handleBack = (): void => {
    router.push('/');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <IconButton onClick={handleBack} sx={{ mr: 1 }}>
        <ArrowBack />
      </IconButton>
      <Typography variant="h6" component="h1" sx={{ fontSize: '1.1rem', fontWeight: '500' }}>
        Transaction Details
      </Typography>
    </Box>
  );
};
