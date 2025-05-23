import { Box, InputAdornment } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface ManualSearchInputAdornmentProps {
    label: string;
}

export const ManualSearchInputAdornment = ({ label }: ManualSearchInputAdornmentProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <InputAdornment position="start">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingY: 1,
                    paddingX: 1.5,
                    bgcolor: isDark ? grey[800] : grey[200],
                }}
            >
                {label}
            </Box>
        </InputAdornment>
    );
};
