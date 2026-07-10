import AssignmentIcon from '@mui/icons-material/Assignment';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Button, Container, Stack, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { type FC } from 'react';

import { FEEDBACK_FORM_URL } from '../helpers/constants';
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
                    href="https://github.com/icssc/AntAlmanac"
                    target="_blank"
                >
                    GitHub
                </Button>
                <Button
                    variant="text"
                    size="large"
                    color="inherit"
                    startIcon={<AssignmentIcon />}
                    href={FEEDBACK_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Feedback
                </Button>
            </Stack>
        </Container>
    );
};

export default Footer;
