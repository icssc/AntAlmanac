import { SnackbarOrigin, VariantType } from 'notistack';
import { create } from 'zustand';

export type SnackbarState = {
    message: string;
    variant: VariantType;
    durationMs: number;
    position: SnackbarOrigin;
    style: Record<string, string>;
    openCount: number;

    openSnackbar: (
        variant: VariantType,
        message: string,
        durationSeconds?: number,
        position?: SnackbarOrigin,
        style?: Record<string, string>
    ) => void;
};

export const useSnackbarStore = create<SnackbarState>((set, get) => ({
    message: '',
    variant: 'info',
    durationMs: 3000,
    position: { vertical: 'bottom', horizontal: 'left' },
    style: {},
    openCount: 0,

    openSnackbar: (variant, message, durationSeconds, position, style) => {
        set({
            variant,
            message,
            durationMs: durationSeconds != null ? durationSeconds * 1000 : 3000,
            position: position ?? get().position,
            style: style ?? get().style,
            openCount: get().openCount + 1,
        });
    },
}));
