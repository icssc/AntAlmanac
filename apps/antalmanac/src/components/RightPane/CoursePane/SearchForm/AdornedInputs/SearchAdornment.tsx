import { Box, InputAdornment } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface SearchAdornmentProps {
    label: string;
    id: string;
    isManual?: boolean;
}

export const SearchAdornment = ({ label, id, isManual }: SearchAdornmentProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <InputAdornment position="start" sx={{ marginRight: 0, paddingLeft: 0 }}>
            <Box
                id={`adornment-label-${id}`}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingY: 1,
                    paddingX: 1.5,
                    minWidth: isManual ? 160 : 100,
                    bgcolor: isDark ? grey[800] : grey[200],
                }}
            >
                {label}
            </Box>
        </InputAdornment>
    );
};
