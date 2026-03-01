import { Stack } from '@mui/material';
import { useState } from 'react';

import HomePageWrapper from '$components/HomePageWrapper';
import SharedScheduleBanner from '$components/SharedScheduleBanner';
import { useIsMobile } from '$hooks/useIsMobile';
import { DesktopHome, MobileHome } from '$routes/Home';

export function SharedSchedulePage() {
    const isMobileScreen = useIsMobile();

    const [error, setError] = useState<string | null>(null);

    return (
        <HomePageWrapper hideHeader={!!error}>
            <Stack
                flex={1}
                justifyContent={error ? 'center' : 'flex-start'}
                alignItems={error ? 'center' : 'stretch'}
                spacing={2}
                sx={error ? { minHeight: '100dvh' } : undefined}
            >
                <SharedScheduleBanner error={error} setError={setError} />
                {!error && (isMobileScreen ? <MobileHome /> : <DesktopHome />)}
            </Stack>
        </HomePageWrapper>
    );
}
