import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { useState } from 'react';

import HomePageWrapper from '$components/HomePageWrapper';
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
        <HomePageWrapper>
            <SharedScheduleBanner error={error} setError={setError} />
            {isMobileScreen ? <MobileHome /> : <DesktopHome />}
        </HomePageWrapper>
    );
}
