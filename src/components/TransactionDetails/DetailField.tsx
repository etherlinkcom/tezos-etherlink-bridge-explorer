'use client';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { CopyButton } from '../shared/CopyButton';
import { StatusChip } from '../shared/StatusChip';
import { EllipsisBox } from '../shared/EllipsisBox';
import { networkStore } from '@/stores/networkStore';
import { getExplorerInfo } from '@/utils/explorerInfo';

export type DetailFieldLabel =
  | 'Error' | 'Transaction Hash' | 'Address' | 'Block' | 'Amount'
  | 'Status' | 'Transaction Type' | 'Transaction Kind' | 'Network Flow'
  | 'Created' | 'Expected' | 'Date';

const COPYABLE_AND_MONOSPACE_LABELS: ReadonlySet<DetailFieldLabel> = new Set(['Transaction Hash', 'Address', 'Block']);

const BOLD_LABELS: ReadonlySet<DetailFieldLabel> = new Set(['Transaction Type', 'Amount']);

const EXPLORER_LABELS: ReadonlySet<DetailFieldLabel> = new Set(['Transaction Hash', 'Address']);

interface DetailFieldProps {
  label: DetailFieldLabel;
  value: string | undefined;
}

export const DetailField = observer(({ label, value }: DetailFieldProps) => {
  const theme = useTheme();
  const isCopyableAndMonospace: boolean = COPYABLE_AND_MONOSPACE_LABELS.has(label);
  const bold: boolean = BOLD_LABELS.has(label);
  const hasExplorer: boolean = EXPLORER_LABELS.has(label);
  const explorerInfo: { url: string; name: string } | null = 
  (value && value !== '-' && hasExplorer) ? getExplorerInfo(value, networkStore.config) : null;

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
            {label === 'Status' ? (
              <StatusChip 
                status={value ?? '-'}
                size="small"
                sx={{ height: '20px' }}
              />
            ) : (
              <EllipsisBox 
                sx={{ 
                  fontSize: '14px',
                  fontWeight: bold ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                  fontFamily: isCopyableAndMonospace ? 'monospace' : 'inherit',
                  maxWidth: { xs: '100%', md: '450px', lg: '100%' }
                }}
              >
                {value ?? '-'}
              </EllipsisBox>
            )}
          </Box>
          
          {isCopyableAndMonospace && value !== undefined && (
            <CopyButton 
              text={value}
              size="small"
              sx={{ p: 0.25, flexShrink: 0 }}
            />
          )}
          
          {explorerInfo && (
            <Tooltip title={`View on ${explorerInfo.name}`}>
              <IconButton
                component="a"
                href={explorerInfo.url}
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
});
