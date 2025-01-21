import { Tooltip, Button } from '@material-ui/core';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { useEffect, useState } from 'react';

// https://stackoverflow.com/questions/51503754/typescript-type-beforeinstallpromptevent
type UserChoice = Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
}>;

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: UserChoice;
    prompt(): Promise<UserChoice>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

function InstallPWA() {
    const [canInstall, setCanInstall] = useState<boolean>(false);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>();

    useEffect(() => {
        const disableInstallHandler = () => {
            setCanInstall(false);
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        };

        const beforeInstallHandler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setCanInstall(true);
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', beforeInstallHandler);
        window.addEventListener('appinstalled', disableInstallHandler);
    }, []);

    const handleInstall = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!installPrompt) return;
        installPrompt.prompt();
    };

    if (!canInstall) return null;

    return (
        <Tooltip title="Install AntAlmanac as a desktop app">
            <Button color="inherit" id="install-pwa-button" startIcon={<BrowserUpdatedIcon />} onClick={handleInstall}>
                Install App
            </Button>
        </Tooltip>
    );
}

export default InstallPWA;
