import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      tableBg: {
        odd: string;
        even: string;
        hover: string;
      };
      border: {
        primary: string;
        secondary: string;
      };
      shadow: {
        primary: string;
        secondary: string;
      };
    };
  }

  interface PaletteOptions {
    custom?: {
      tableBg?: {
        odd?: string;
        even?: string;
        hover?: string;
      };
      border?: {
        primary?: string;
        secondary?: string;
      };
      shadow?: {
        primary?: string;
        secondary?: string;
      };
    };
  }

  interface TypographyVariants {
    link: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    link?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    link: true;
  }
}