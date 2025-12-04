import { Box, Button, Typography } from '@mui/material';
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

export const DiscordSupportButton = ({ onClick }: { onClick?: () => Promise<void> }): React.ReactNode => {
  const handleClick = (): void => {
    onClick?.();
    window.open(DISCORD_SUPPORT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      endIcon={<Launch />}
    >
      Open Discord Support
    </Button>
  );
};