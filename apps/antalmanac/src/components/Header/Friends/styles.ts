import { DARK_SURFACE } from '$src/globals';
import type { SxProps, Theme } from '@mui/material';

export const friendCardSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    bgcolor: DARK_SURFACE,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    '&:hover': {
        bgcolor: 'action.hover',
        borderColor: 'text.secondary',
    },
    transition: 'all 0.2s ease',
};

export const textFieldSx: SxProps<Theme> = {
    '& .MuiInput-root': { fontSize: '1rem' },
    '& .MuiInput-underline:before': { borderBottomColor: '#FFFFFF6B' },
    '& .MuiInput-underline:hover:before': { borderBottomColor: '#FFFFFF6B !important' },
    '& .MuiInput-underline:after': { borderBottomColor: '#FFFFFF6B' },
    '& .MuiInputBase-input::placeholder': { color: '#FFFFFF6B', opacity: 1 },
};
