import {
    getLocalStorageAutoSave,
    getLocalStorageDevMode,
    getLocalStoragePreviewMode,
    getLocalStorageShow24HourTime,
    setLocalStorageAutoSave,
    setLocalStorageDevMode,
    setLocalStoragePreviewMode,
    setLocalStorageShow24HourTime,
} from '$lib/localStorage';
import { create } from 'zustand';

interface TimeFormatStore {
    isMilitaryTime: boolean;
    setTimeFormat: (militaryTime: boolean) => void;
}

export const useTimeFormatStore = create<TimeFormatStore>((set) => {
    const isMilitaryTime = typeof Storage !== 'undefined' && getLocalStorageShow24HourTime() == 'true';

    return {
        isMilitaryTime,
        setTimeFormat: (isMilitaryTime) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageShow24HourTime(isMilitaryTime.toString());
            }
            set({ isMilitaryTime });
        },
    };
});
interface PreviewStore {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => {
    const previewMode = typeof Storage !== 'undefined' && getLocalStoragePreviewMode() == 'true';

    return {
        previewMode: previewMode,
        setPreviewMode: (previewMode) => {
            if (typeof Storage !== 'undefined') {
                setLocalStoragePreviewMode(previewMode.toString());
            }

            set({ previewMode: previewMode });
        },
    };
});

interface AutoSaveStore {
    autoSave: boolean;
    setAutoSave: (autoSave: boolean) => void;
}

export const useAutoSaveStore = create<AutoSaveStore>((set) => {
    const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() == 'true';

    return {
        autoSave,
        setAutoSave: (autoSave) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageAutoSave(autoSave.toString());
            }
            set({ autoSave });
        },
    };
});

interface DevModeStore {
    devMode: boolean;
    setDevMode: (devMode: boolean) => void;
}

export const useDevModeStore = create<DevModeStore>((set) => {
    const stored = typeof Storage !== 'undefined' ? getLocalStorageDevMode() : null;
    const isLocalDev = process.env.NODE_ENV === 'development';
    const devMode = stored === null ? isLocalDev : stored === 'true';

    return {
        devMode,
        setDevMode: (devMode: boolean) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageDevMode(devMode.toString());
            }
            set({ devMode });
        },
    };
});
