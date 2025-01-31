import { create } from 'zustand';
import { VariantType } from 'notistack';
import { SnackbarPosition } from '$components/NotificationSnackbar';

interface SnackbarStore {
    snackbarMessage: string;
    snackbarVariant: VariantType;
    snackbarDuration: number;
    snackbarPosition: SnackbarPosition;
    snackbarStyle: Record<string, string>;

    getSnackbarMessage: () => string;
    getSnackbarVariant: () => VariantType;
    getSnackbarDuration: () => number;
    getSnackbarPosition: () => SnackbarPosition;
    getSnackbarStyle: () => Record<string, string>;

    openSnackbar: (
        variant: VariantType,
        message: string,
        duration?: number,
        position?: SnackbarPosition,
        style?: Record<string, string>
    ) => void;
}

export const useSnackbarStore = create<SnackbarStore>((set, get) => ({
    // State
    snackbarMessage: '',
    snackbarVariant: 'info',
    snackbarDuration: 3000,
    snackbarPosition: { vertical: 'bottom', horizontal: 'left' },
    snackbarStyle: {},

    // Getters (Same as AppStore methods)
    getSnackbarMessage: () => get().snackbarMessage,
    getSnackbarVariant: () => get().snackbarVariant,
    getSnackbarDuration: () => get().snackbarDuration,
    getSnackbarPosition: () => get().snackbarPosition,
    getSnackbarStyle: () => get().snackbarStyle,

    openSnackbar: (variant, message, duration, position, style) => {
        set((state) => ({
            snackbarMessage: message,
            snackbarVariant: variant,
            snackbarDuration: duration ?? state.snackbarDuration,
            snackbarPosition: position ?? state.snackbarPosition,
            snackbarStyle: style ?? {},
        }));
    },
}));