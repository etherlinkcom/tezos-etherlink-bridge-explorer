'use client';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from '@/theme/index';
import { toastConfig } from '@/theme/toastConfig';
import { ReactNode } from 'react';

interface ClientThemeProviderProps {
  children: ReactNode;
}

export function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster {...toastConfig} />
    </ThemeProvider>
  );
}
