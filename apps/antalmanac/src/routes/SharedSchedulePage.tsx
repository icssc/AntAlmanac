import HomeLayout from '$components/HomeLayout';
import SharedScheduleBanner from '$components/SharedScheduleBanner';
import { useIsMobile } from '$hooks/useIsMobile';
import { DesktopHome, MobileHome } from '$routes/Home';
import { Stack } from '@mui/material';
import { useState } from 'react';

export function SharedSchedulePage() {
    const isMobileScreen = useIsMobile();

    const [error, setError] = useState<string | null>(null);

    const isBlocked = !!error;

    return (
        <HomeLayout hideHeader={isBlocked}>
            <Stack
                flex={1}
                justifyContent={isBlocked ? 'center' : 'flex-start'}
                alignItems={isBlocked ? 'center' : 'stretch'}
                spacing={2}
                sx={isBlocked ? { minHeight: '100dvh' } : undefined}
            >
                <SharedScheduleBanner error={error} setError={setError} />
                {!isBlocked && (isMobileScreen ? <MobileHome /> : <DesktopHome />)}
            </Stack>
        </HomeLayout>
    );
}
