import { useState } from 'react';
import { IconButton, SxProps } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps
}

export const CopyButton = ({
  text,
  message = 'Copied to clipboard!',
  size = 'small',
  sx
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    try {
      event?.stopPropagation();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.dismiss();
      toast.success(message);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <IconButton
      component='span'
      size={size}
      onClick={handleCopy}
      sx={{
        ...(copied && {
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }),
        ...sx,
      }}
    >
      {copied ? (
        <CheckIcon
          fontSize={size}
          sx={{pointerEvents: 'none'}}
        />
      ) : (
        <ContentCopyIcon fontSize={size} />
      )}
    </IconButton>
  );
};