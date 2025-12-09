import { Theme, alpha, keyframes } from '@mui/material/styles';

export const createHighlightAnimation = (theme: Theme) => keyframes`
  0% {
    background-color: ${alpha(theme.palette.success.main, 0.15)};
    border-left: 6px solid ${theme.palette.success.main};
  }
  15% {
    background-color: ${alpha(theme.palette.success.main, 0.08)};
    border-left: 4px solid ${theme.palette.success.main};
  }
  85% {
    background-color: ${alpha(theme.palette.success.main, 0.08)};
    border-left: 4px solid ${theme.palette.success.main};
  }
  100% {
    background-color: ${alpha(theme.palette.success.main, 0.04)};
    border-left: 0px solid transparent;
  }
`;
