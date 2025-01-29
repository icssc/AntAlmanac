import { Tooltip, IconButton, Button } from '@material-ui/core';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { BeforeInstallPromptEvent, usePWAStore } from '$stores/PWAStore';

function InstallPWAButton() {
    const [setInstallPrompt, setCanInstall, canInstall, installPrompt] = usePWAStore(
        (state) => [state.setInstallPrompt, state.setCanInstall, state.canInstall, state.installPrompt],
        shallow
    );

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    if (!canInstall) return null;

    return (
        <Tooltip title="Install AntAlmanac as a desktop app">
            {isMobile ? (
                <IconButton color="inherit" id="install-pwa-button" onClick={handleInstall} hidden={!canInstall}>
                    <BrowserUpdatedIcon />
                </IconButton>
            ) : (
                <Button
                    color="inherit"
                    id="install-pwa-button"
                    startIcon={<BrowserUpdatedIcon />}
                    onClick={handleInstall}
                >
                    Install App
                </Button>
            )}
        </Tooltip>
    );
}

export default InstallPWAButton;
