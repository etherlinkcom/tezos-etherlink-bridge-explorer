import { Theme, alpha, keyframes } from '@mui/material/styles';

export const createFadeInHighlight = (theme: Theme) => keyframes`
  0% {
    background-color: ${alpha(theme.palette.success.main, 0.15)};
    border-left-width: 6px;
  }
  100% {
    background-color: ${alpha(theme.palette.success.main, 0.08)};
    border-left-width: 4px;
  }
`;
