import { DARK_SURFACE } from '$src/globals';
import type { SxProps, Theme } from '@mui/material';

export const friendCardSx: SxProps<Theme> = (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    bgcolor: theme.palette.mode === 'dark' ? DARK_SURFACE : theme.palette.grey[100],
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[300],
    boxShadow: 'none',
    '&:hover': {
        bgcolor: 'action.hover',
        borderColor: 'text.secondary',
    },
    transition: 'all 0.2s ease',
});

export const textFieldSx: SxProps<Theme> = (theme: Theme) => ({
    '& .MuiInput-root': { fontSize: '1rem' },
    '& .MuiInput-underline:before': {
        borderBottomColor: theme.palette.mode === 'dark' ? '#FFFFFF6B' : theme.palette.divider,
    },
    '& .MuiInput-underline:hover:before': {
        borderBottomColor:
            theme.palette.mode === 'dark' ? '#FFFFFF6B !important' : `${theme.palette.text.secondary} !important`,
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: theme.palette.mode === 'dark' ? '#FFFFFF6B' : theme.palette.primary.main,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.mode === 'dark' ? '#FFFFFF6B' : theme.palette.text.secondary,
        opacity: 1,
    },
});
