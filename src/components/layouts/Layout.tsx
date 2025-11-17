'use client';

import { Box, Container, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #38FF9C 30%, #A3FFD1 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Tezos-Etherlink Bridge Explorer
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Explore bridge transactions between Tezos (L1) and Etherlink (L2). 
            Track deposits, withdrawals, and fast withdrawal operations.
          </Typography>
        </Container>
      </Box>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};