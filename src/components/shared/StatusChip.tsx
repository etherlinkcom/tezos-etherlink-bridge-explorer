import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
  sx?: ChipProps['sx'];
}

const getStatusColor = (status: string): ChipProps['color'] => {
  switch (String(status).toUpperCase()) {
    case 'FINISHED': return 'success';
    case 'PENDING':  return 'warning';
    case 'FAILED':   return 'error';
    case 'CREATED':  return 'info';
    case 'SEALED':   return 'info';
    default:         return 'info';
  }
};

export const StatusChip = ({ status, size = 'small', sx }: StatusChipProps) => {
  return (
    <Chip 
      label={status} 
      size={size}
      color={getStatusColor(status)}
      sx={sx}
    />
  );
};
