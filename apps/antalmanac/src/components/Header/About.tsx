import { Info, Assignment, FavoriteRounded } from '@mui/icons-material';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
    Stack,
    Tooltip,
} from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { FEEDBACK_LINK } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

const DONATION_LINK = 'https://venmo.com/u/ICSSC';

const AboutButton = () => {
    const [open, setOpen] = useState(false);
    const { isDark } = useThemeStore();
    const postHog = usePostHog();

    const handleOpen = useCallback(() => {
        setOpen(true);
        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CLICK_ABOUT,
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button onClick={handleOpen} color="inherit" startIcon={<Info />} size="large" variant="text">
                About
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>About</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        AntAlmanac is a schedule planning tool for UCI students.
                        <br />
                        <br />
                        Interested in helping out? Join our{' '}
                        <Link target="_blank" href="https://discord.gg/GzF76D7UhY">
                            Discord
                        </Link>{' '}
                        or checkout the{' '}
                        <Link target="_blank" href="https://github.com/icssc/AntAlmanac">
                            code on GitHub
                        </Link>
                        .
                        <br />
                        <br />
                        This website is maintained by the{' '}
                        <Link target="_blank" href="https://studentcouncil.ics.uci.edu/">
                            ICS Student Council
                        </Link>{' '}
                        Projects Committee and built by students from the UCI community.
                        <br />
                        <br />
                        To support the ongoing development and enhancement of AntAlmanac, consider making a{' '}
                        <Link target="_blank" href={DONATION_LINK}>
                            donation
                        </Link>
                        ; your generosity helps us continue our mission.
                        <br />
                        <br />
                        <Link target="_blank" href="https://github.com/icssc/AntAlmanac/contributors">
                            <img
                                src="https://contrib.rocks/image?repo=icssc/antalmanac"
                                width="100%"
                                alt="AntAlmanac Contributors"
                            />
                        </Link>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const FeedbackButton = () => {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                color="inherit"
                startIcon={<Assignment />}
                size="large"
                variant="text"
                href={FEEDBACK_LINK}
                target="_blank"
            >
                Feedback
            </Button>
        </Tooltip>
    );
};

const DonateButton = () => {
    return (
        <Tooltip title="Help us pay for the servers!">
            <Button
                color="inherit"
                startIcon={<FavoriteRounded />}
                size="large"
                variant="text"
                href={DONATION_LINK}
                target="_blank"
            >
                Donate
            </Button>
        </Tooltip>
    );
};

export function About() {
    return (
        <Stack direction="row" sx={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
            <DonateButton />
            <AboutButton />
            <FeedbackButton />
        </Stack>
    );
}
