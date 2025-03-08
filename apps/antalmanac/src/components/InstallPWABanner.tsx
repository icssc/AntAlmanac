import { IconButton, Button } from '@material-ui/core';
import { Close } from '@mui/icons-material';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { Alert, Box, Slide } from '@mui/material';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { getLocalStoragePWADismissalTime, setLocalStoragePWADismissalTime } from '$lib/localStorage';
import { BeforeInstallPromptEvent, usePWAStore } from '$stores/PWAStore';

function InstallPWABanner() {
    const [setInstallPrompt, setCanInstall, canInstall, installPrompt] = usePWAStore(
        (state) => [state.setInstallPrompt, state.setCanInstall, state.canInstall, state.installPrompt],
        shallow
    );

    const [bannerVisibility, setBannerVisibility] = useState(false);

    useEffect(() => {
        const timeoutIn = setTimeout(() => {
            setBannerVisibility(true);
        }, 15000);

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
            clearTimeout(timeoutIn);
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
            window.removeEventListener('appinstalled', disableInstallHandler);
        };
    }, [setCanInstall, setInstallPrompt]);

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
        <Box
            sx={{
                position: 'fixed',
                top: 90,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 999,
            }}
        >
            <Slide direction="down" in={displayPWABanner} timeout={500} mountOnEnter unmountOnExit>
                <Alert
                    icon={false}
                    severity="info"
                    sx={{
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        borderRadius: 1,
                    }}
                    action={
                        <IconButton
                            aria-label="close"
                            size="large"
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
                    <Button id="install-pwa-button" startIcon={<BrowserUpdatedIcon />} onClick={handleInstall}>
                        Install
                    </Button>
                </Alert>
            </Slide>
        </Box>
    );
}

export default InstallPWABanner;
