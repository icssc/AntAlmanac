import { useThemeStore } from '$stores/SettingsStore';
import { Box } from '@mui/material';
import Image from 'next/image';

export function LoadingMessage() {
    const isDark = useThemeStore((store) => store.isDark);

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
