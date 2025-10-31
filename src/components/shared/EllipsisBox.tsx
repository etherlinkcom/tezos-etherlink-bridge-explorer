import { Box, BoxProps } from '@mui/material';

export const EllipsisBox = (props: BoxProps) => (
  <Box
    {...props}
    sx={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: { xs: '70vw', sm: '80vw' },
      display: 'block',
      ...props.sx,
    }}
  />
);