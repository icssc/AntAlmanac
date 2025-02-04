import { IconButton, Button } from '@material-ui/core';
import { Close } from '@mui/icons-material';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { Alert, Box, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { getLocalStoragePWADismissalTime, setLocalStoragePWADismissalTime } from '$lib/localStorage';
import { BeforeInstallPromptEvent, usePWAStore } from '$stores/PWAStore';
import { useThemeStore } from '$stores/SettingsStore';

function InstallPWABanner() {
    const [setInstallPrompt, setCanInstall, canInstall, installPrompt] = usePWAStore(
        (state) => [state.setInstallPrompt, state.setCanInstall, state.canInstall, state.installPrompt],
        shallow
    );

    const [bannerVisibility, setBannerVisibility] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = useThemeStore((store) => store.isDark);

    useEffect(() => {
        const beforeInstallHandler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setCanInstall(true);
            setInstallPrompt(e);
        };

        const disableInstallHandler = () => {
            setCanInstall(false);
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        };

        window.addEventListener('beforeinstallprompt', beforeInstallHandler);
        window.addEventListener('appinstalled', disableInstallHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
            window.removeEventListener('appinstalled', disableInstallHandler);
        };
    }, []);

    const handleInstall = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (installPrompt) {
            e.preventDefault();
            if (!installPrompt) return;
            installPrompt.prompt();
        }
    };

    const PWADismissalTime = getLocalStoragePWADismissalTime();

    const dismissedRecently =
        PWADismissalTime !== null && Date.now() - parseInt(PWADismissalTime) < 4 * 7 * 24 * 3600 * 1000;

    const displayPWABanner = bannerVisibility && !dismissedRecently && canInstall;

    return (
        <Box sx={{ position: 'fixed', bottom: isMobile ? 180 : 90, right: 20, zIndex: 999 }}>
            {displayPWABanner ? (
                <Alert
                    icon={false}
                    severity="info"
                    style={{
                        color: isDark ? '#ece6e6' : '#2e2e2e',
                        backgroundColor: isDark ? '#2e2e2e' : '#ece6e6',
                    }}
                    action={
                        <IconButton
                            aria-label="close"
                            size="small"
                            color="inherit"
                            onClick={() => {
                                setLocalStoragePWADismissalTime(Date.now().toString());
                                setBannerVisibility(false);
                            }}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Want quicker access to your schedules?
                    <br />
                    <Button id="install-pwa-button" startIcon={<BrowserUpdatedIcon />} onClick={handleInstall}>
                        Install AntAlmanac app
                    </Button>
                    <br />
                </Alert>
            ) : null}
        </Box>
    );
}

export default InstallPWABanner;
