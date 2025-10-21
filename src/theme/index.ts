import { createTheme } from '@mui/material/styles';
import { theme as paletteConfig } from './palette';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { spacing } from './spacing';
import { components } from './components';

export const theme = createTheme({
  palette: paletteConfig,
  typography,
  breakpoints,
  spacing,
  components,
  shape: {
    borderRadius: '25px',
  },
});