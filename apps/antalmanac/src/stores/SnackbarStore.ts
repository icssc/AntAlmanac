import { Alert, Snackbar, SxProps } from '@mui/material';
import { ComponentProps } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

interface SnackbarOptions {
    message: string;
    severity: ComponentProps<typeof Alert>['severity'];
    durationSeconds: number;
    position: ComponentProps<typeof Snackbar>['anchorOrigin'];
    style: SxProps | null;
}

const DEFAULT_DURATION_SECONDS: SnackbarOptions['durationSeconds'] = 3;
const DEFAULT_POSITION: SnackbarOptions['position'] = { vertical: 'bottom', horizontal: 'left' };
const DEFAULT_STYLE: SnackbarOptions['style'] = null;

const initialState: SnackbarOptions & { open: boolean } = {
    open: false,
    message: '',
    severity: 'info',
    durationSeconds: DEFAULT_DURATION_SECONDS,
    position: DEFAULT_POSITION,
    style: DEFAULT_STYLE,
};

export const useSnackbarStore = create(
    combine(initialState, (set) => ({
        snackbarClosed: () => set({ open: false }),
    }))
);

/**
 * @param severity The type/variant of the snackbar.
 * @param message String to display.
 * @param durationSeconds Defaults to 3 seconds.
 * @param position Defaults to bottom left.
 * @param style Custom snackbar styles.
 */
export function openSnackbar(
    severity: SnackbarOptions['severity'],
    message: SnackbarOptions['message'],
    {
        durationSeconds = DEFAULT_DURATION_SECONDS,
        position = DEFAULT_POSITION,
        style = DEFAULT_STYLE,
    }: Partial<Omit<SnackbarOptions, 'severity' | 'message'>> = {}
) {
    useSnackbarStore.setState({ open: true, message, severity, durationSeconds, position, style });
}
