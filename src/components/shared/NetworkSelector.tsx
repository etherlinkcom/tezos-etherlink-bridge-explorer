'use client';

import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { networkStore, NetworkType } from '@/stores/networkStore';

export const NetworkSelector = observer(() => {
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  
  const handleNetworkChange = (event: { target: { value: unknown } }): void => {
    const newNetwork: NetworkType = event.target.value as NetworkType;
    networkStore.setNetwork(newNetwork);
  };

  useEffect(() => {
    if (!open) return;

    const handleScroll = (): void => {
      setOpen(false);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  if (!networkStore.isInitialized) {
    return (
      <Box
        sx={{
          borderRadius: '25px',
          border: `1px solid ${theme.palette.custom.border.primary}`,
          padding: '2px',
          minWidth: '180px',
          height: '40px',
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        borderRadius: '25px',
        border: `1px solid ${theme.palette.custom.border.primary}`,
        padding: '2px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          border: `1px solid ${theme.palette.primary.main}`,
          boxShadow: `0px 0px 3px 0px ${theme.palette.custom.shadow.secondary}`,
          transform: 'translateY(-1px)',
        }
      }}
    >
      <FormControl size="small" sx={{ minWidth: '180px' }}>
          <Select
            value={networkStore.currentNetwork}
            onChange={handleNetworkChange}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            aria-label="network selection"
            variant="standard"
            disableUnderline
            MenuProps={{
              PaperProps: {
                className: 'NetworkSelectorMenuStyles',
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
            }}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              '& .MuiSelect-select': {
                py: 0.5,
                textAlign: 'center',
                paddingRight: '14px !important',
                paddingLeft: '14px !important',
              },
              '& .MuiSelect-icon': {
                display: 'none',
              }
            }}
          >
            <MenuItem value="mainnet">Mainnet</MenuItem>
            <MenuItem value="testnet">Shadownet Testnet</MenuItem>
          </Select>
      </FormControl>
    </Box>
  );
});

