import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { useState } from 'react';

import { Header } from '$components/Header/Header';
import { HelpMenu } from '$components/HelpMenu/HelpMenu';
import InstallPWABanner from '$components/InstallPWABanner';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import SharedScheduleBanner from '$components/SharedScheduleBanner';
import { useIsMobile } from '$hooks/useIsMobile';
import { DesktopHome, MobileHome } from '$routes/Home';

export function SharedSchedulePage() {
    const isMobileScreen = useIsMobile();

    const [error, setError] = useState<string | null>(null);

    if (error) {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack component="main" height="100dvh" justifyContent="center" alignItems="center" spacing={2}>
                    <SharedScheduleBanner error={error} setError={setError} />
                </Stack>
            </LocalizationProvider>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <PatchNotes />
            <InstallPWABanner />

            <Stack component="main" height="100dvh">
                <Header />
                <SharedScheduleBanner error={error} setError={setError} />
                {isMobileScreen ? <MobileHome /> : <DesktopHome />}
            </Stack>

            <NotificationSnackbar />
            <HelpMenu />
        </LocalizationProvider>
    );
}
