import { Button, Container, Stack, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { FC } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ICSSCLogo from './IcsscLogo';

const Footer: FC<{ className?: string }> = ({ className }) => {
  const theme = useTheme();

  const stackStyleOverrides = {
    color: theme.palette.text.secondary,
    gap: 2,
    justifyContent: 'center',
  };

  const showFullText = useMediaQuery('(min-width: 440px)');
  const icsscLogo = <SvgIcon inheritViewBox component={ICSSCLogo} />;
  const icsscText = showFullText ? 'ICSSC Projects' : 'ICSSC';

  return (
    <Container className={className}>
      <Stack direction="row" sx={stackStyleOverrides}>
        <Button
          variant="text"
          size="large"
          color="inherit"
          startIcon={icsscLogo}
          href="https://studentcouncil.ics.uci.edu/projects"
          target="_blank"
        >
          {icsscText}
        </Button>
        <Button
          variant="text"
          size="large"
          color="inherit"
          startIcon={<GitHubIcon />}
          href="https://github.com/icssc/peterportal-client"
          target="_blank"
        >
          GitHub
        </Button>
        <Button
          variant="text"
          size="large"
          color="inherit"
          startIcon={<AssignmentIcon />}
          href="https://form.asana.com/?k=VRhMN_PtqQVRZrixgbYIZA&d=1208267282546207"
          target="_blank"
        >
          Feedback
        </Button>
      </Stack>
    </Container>
  );
};

export default Footer;
