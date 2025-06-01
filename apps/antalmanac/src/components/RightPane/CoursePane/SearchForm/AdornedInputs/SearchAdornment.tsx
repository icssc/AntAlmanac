import { Box, InputAdornment } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface SearchAdornmentProps {
    label: string;
    id: string;
    isAligned?: boolean;
}

export const SearchAdornment = ({ label, id, isAligned }: SearchAdornmentProps) => {
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
                    minWidth: isAligned ? '10rem' : '6rem',
                    bgcolor: isDark ? grey[800] : grey[200],
                    userSelect: 'none',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {label}
            </Box>
        </InputAdornment>
    );
};
