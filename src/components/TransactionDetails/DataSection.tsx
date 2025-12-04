import { Box, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface DataSectionProps {
  title: string;
  children: ReactNode;
  showDivider?: boolean;
}

export const DataSection = ({ 
  title, 
  children, 
  showDivider = false
}: DataSectionProps) => {
  const theme = useTheme();

  return (
    <>
      {showDivider && <Divider sx={{ my: 1 }} />}
      
      <Box sx={{ mb: theme.spacing(1) }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            my: theme.spacing(2.5)
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) }}>
          {children}
        </Box>
      </Box>
    </>
  );
};
