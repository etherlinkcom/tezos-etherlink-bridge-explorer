'use client';
import { Box, Typography, Link, Tooltip, IconButton } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { CopyButton } from '../shared/CopyButton';
import { StatusChip } from '../shared/StatusChip';
import { EllipsisBox } from '../shared/EllipsisBox';

type FieldKind = 'hash' | 'address' | 'status' | 'text' | 'block';

interface DetailFieldProps {
  label: string;
  value: string | undefined;
  kind?: FieldKind;
  copyable?: boolean;
  monospace?: boolean;
  bold?: boolean;
  explorerUrl?: string | null;
  explorerName?: string | null;
}

export const DetailField = ({ 
  label, 
  value, 
  kind,
  copyable = false, 
  bold = false,
  monospace = false,
  explorerUrl,
  explorerName,
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', md: 'auto' }}}>
          <Box sx={{ minWidth: 0, ml: theme.spacing(1) }}>
            {kind === 'status' ? (
              <StatusChip 
                status={value ?? ''}
                size="small"
                sx={{ height: '20px' }}
              />
            ) : (
              <EllipsisBox 
                sx={{ 
                  fontSize: '14px',
                  fontWeight: bold ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                  fontFamily: monospace ? 'monospace' : 'inherit',
                  maxWidth: { xs: '100%', md: '450px', lg: '100%' }
                }}
              >
                {value ?? ''}
              </EllipsisBox>
            )}
          </Box>
          
          {copyable && value !== undefined && (
            <CopyButton 
              text={value}
              size="small"
              sx={{ p: 0.25, flexShrink: 0 }}
            />
          )}
          
          {explorerUrl && explorerName && (
            <Tooltip title={`View on ${explorerName}`}>
              <IconButton
                component="a"
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ 
                  p: 0.25,
                  flexShrink: 0,
                  color: 'inherit',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};
