import { Theme, alpha, keyframes } from '@mui/material/styles';

export const createHighlightAnimation = (theme: Theme) => keyframes`
  0% {
    background-color: ${alpha(theme.palette.success.main, 0.15)};
    border-left: 6px solid ${theme.palette.success.main};
  }
  100% {
    background-color: ${alpha(theme.palette.success.main, 0.00)};
    border-left: 0px solid transparent;
  }
`;

export const createHighlightAnimationMobile = (theme: Theme) => keyframes`
  0% {
    background-color: ${alpha(theme.palette.success.main, 0.15)};
  }
  100% {
    background-color: ${alpha(theme.palette.success.main, 0.00)};
  }
`;