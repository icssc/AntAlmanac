import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { useCallback, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { useThemeStore } from '$stores/SettingsStore';

const AboutPage = () => {
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
            <Button onClick={handleOpen} color="inherit" startIcon={<Info />}>
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
                        <Link target="_blank" href="https://venmo.com/u/ICSSC">
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

export default AboutPage;
