import { Box, Typography, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CopyButton } from '../shared/CopyButton';
import { StatusChip } from '../shared/StatusChip';

type FieldKind = 'hash' | 'address' | 'status' | 'text';

interface DetailFieldProps {
  label: string;
  value: string;
  kind?: FieldKind;
  copyable?: boolean;
  monospace?: boolean;
  bold?: boolean;
  tooltip?: string;
}

export const DetailField = ({ 
  label, 
  value, 
  kind,
  copyable = false, 
  monospace = false,
  bold = false,
  tooltip
}: DetailFieldProps) => {
  const theme = useTheme();
  const displayValue: string = typeof value === 'string' ? value : '';
  
  return (
    <Box sx={{ mb: theme.spacing(1.5) }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {(() => {
          const typography = (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                minWidth: '200px',
                fontWeight: 500,
                flexShrink: 0,
                cursor: tooltip ? 'help' : 'default'
              }}
            >
              {label}:
            </Typography>
          );
          
          return tooltip ? (
            <Tooltip title={tooltip} arrow placement="top">
              {typography}
            </Tooltip>
          ) : typography;
        })()}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0, ml: theme.spacing(1) }}>
            {kind === 'status' ? (
              <StatusChip 
                status={value}
                size="small"
                sx={{ height: '20px', fontSize: '0.7rem' }}
              />
            ) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: monospace ? 'monospace' : theme.typography.fontFamily,
                  fontWeight: bold ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
                  wordBreak: 'break-all'
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
          
          {copyable && displayValue && (
            <CopyButton 
              text={displayValue}
              size="small"
              sx={{ p: 0.25, flexShrink: 0 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
