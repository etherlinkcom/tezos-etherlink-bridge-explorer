'use client';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CopyButton } from '../shared/CopyButton';
import { StatusChip } from '../shared/StatusChip';

type FieldKind = 'hash' | 'address' | 'status' | 'text' | 'block';

interface DetailFieldProps {
  label: string;
  value: string | undefined;
  kind?: FieldKind;
  copyable?: boolean;
  monospace?: boolean;
  bold?: boolean;
}

export const DetailField = ({ 
  label, 
  value, 
  kind,
  copyable = false, 
  bold = false,
}: DetailFieldProps) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: theme.spacing(1.5) }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: { xs: 'column', md: 'row' } }}> 
          <Typography 
            variant="caption"
            color="text.secondary"
            sx={{ 
              fontSize: '14px',
              fontFamily: theme.typography.fontFamily,
              minWidth: '200px',
              fontWeight: 500,
              flexShrink: 0,
              cursor: 'default',
            }}
          >
            {label}:
          </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0, ml: theme.spacing(1) }}>
            {kind === 'status' ? (
              <StatusChip 
                status={value ?? ''}
                size="small"
                sx={{ height: '20px' }}
              />
            ) : (
              <Typography 
                sx={{ 
                  fontSize: '14px',
                  fontWeight: bold ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                  wordBreak: 'break-all'
                }}
              >
                {value ?? ''}
              </Typography>
            )}
          </Box>
          
          {copyable && value !== undefined && (
            <CopyButton 
              text={value}
              size="small"
              sx={{ p: 0.25, flexShrink: 0 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
