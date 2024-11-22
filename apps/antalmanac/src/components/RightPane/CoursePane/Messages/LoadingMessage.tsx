import { Box } from '@mui/material';

import darkModeLoadingGif from '../SearchForm/Gifs/dark-loading.gif';
import loadingGif from '../SearchForm/Gifs/loading.gif';

import { useThemeStore } from '$stores/SettingsStore';

export function LoadingMessage() {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading courses" />
        </Box>
    );
}
