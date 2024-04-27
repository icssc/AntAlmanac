import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
    Tooltip,
} from '@material-ui/core';
import { Assignment, Info } from '@material-ui/icons';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { ButtonGroup } from '@mui/material';
import { useCallback, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { useThemeStore } from '$stores/SettingsStore';

const DONATION_LINK = 'https://venmo.com/u/ICSSC';

const About = () => {
    const [open, setOpen] = useState(false);

    const { isDark } = useThemeStore();

    const handleOpen = useCallback(() => {
        setOpen(true);
        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.CLICK_ABOUT,
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button onClick={handleOpen} color="inherit" startIcon={<Info />} size="large">
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
                                width={'100%'}
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

const Feedback = () => {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                onClick={() => {
                    window.open('https://forms.gle/k81f2aNdpdQYeKK8A', '_blank');
                }}
                color="inherit"
                startIcon={<Assignment />}
                size="large"
            >
                Feedback
            </Button>
        </Tooltip>
    );
};

const Donate = () => {
    return (
        <Tooltip title="Help us pay for the servers!">
            <Button
                onClick={() => {
                    window.open(DONATION_LINK, '_blank');
                }}
                color="inherit"
                startIcon={<FavoriteRoundedIcon />}
                size="large"
            >
                Donate
            </Button>
        </Tooltip>
    );
};

export function AboutButtonGroup() {
    return (
        <ButtonGroup
            style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
                borderColor: 'unset',
            }}
        >
            <Donate />
            <About />
            <Feedback />
        </ButtonGroup>
    );
}
