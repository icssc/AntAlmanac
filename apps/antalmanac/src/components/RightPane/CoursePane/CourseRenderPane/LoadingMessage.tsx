import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { Box } from '@mui/material';
import Image from 'next/image';

export function LoadingMessage() {
    const isDark = useIsDarkMode();

    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                src={isDark ? '/course-search/dark-loading.gif' : '/course-search/loading.gif'}
                alt="Loading courses"
                width={370}
                height={220}
                unoptimized
            />
        </Box>
    );
}
