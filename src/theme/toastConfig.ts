import { ToasterProps } from 'react-hot-toast';
import { theme } from './index';

export const toastConfig: ToasterProps = {
  position: 'bottom-center',
  toastOptions: {
    duration: 3000,
    style: {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
      boxShadow: `0px 0px 6px 0px ${theme.palette.divider}`,
      padding: '16px',
      fontSize: '14px',
      fontFamily: theme.typography.fontFamily,
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
    },
    success: {
      iconTheme: {
        primary: theme.palette.success.main,
        secondary: theme.palette.background.paper,
      },
    },
    error: {
      iconTheme: {
        primary: theme.palette.error.main,
        secondary: theme.palette.background.paper,
      },
    },
  },
};

