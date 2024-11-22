import { Box } from '@mui/material';

import darkNoNothing from '../static/dark-no_results.png';
import noNothing from '../static/no_results.png';

import { useThemeStore } from '$stores/SettingsStore';

export function ErrorMessage() {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
                src={isDark ? darkNoNothing : noNothing}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%' }}
            />
        </Box>
    );
}
