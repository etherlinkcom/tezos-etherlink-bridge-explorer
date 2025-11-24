import { Box, Button, Link, Typography } from '@mui/material';
import { Launch } from '@mui/icons-material';

const DISCORD_SUPPORT_URL: string = 'https://discord.gg/T6WnWB3dcr';

export const DiscordSupportSteps = (): React.ReactNode => (
  <>
    <Typography component="li" variant="body1">
      Join our Discord server using the button below
    </Typography>
    <Typography component="li" variant="body1">
      Navigate to the <Box component="strong">support channel</Box> and create a ticket
    </Typography>
    <Typography component="li" variant="body1">
      Provide your transaction hash and a description of the issue
    </Typography>
  </>
);

export const DiscordSupportButton = (): React.ReactNode => (
  <Button
    variant="contained"
    color="primary"
    href={DISCORD_SUPPORT_URL}
    target="_blank"
    rel="noopener noreferrer"
    component={Link}
    endIcon={<Launch />}
    sx={{ textDecoration: 'none' }}
  >
    Open Discord Support
  </Button>
);