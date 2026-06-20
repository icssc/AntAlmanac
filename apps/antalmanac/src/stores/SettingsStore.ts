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
    const isMilitaryTime = getLocalStorageShow24HourTime() == 'true';

    return {
        isMilitaryTime,
        setTimeFormat: (isMilitaryTime) => {
            setLocalStorageShow24HourTime(isMilitaryTime.toString());
            set({ isMilitaryTime });
        },
    };
});
interface PreviewStore {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => {
    const previewMode = getLocalStoragePreviewMode() == 'true';

    return {
        previewMode: previewMode,
        setPreviewMode: (previewMode) => {
            setLocalStoragePreviewMode(previewMode.toString());
            set({ previewMode: previewMode });
        },
    };
});

interface AutoSaveStore {
    autoSave: boolean;
    setAutoSave: (autoSave: boolean) => void;
}

export const useAutoSaveStore = create<AutoSaveStore>((set) => {
    const autoSave = getLocalStorageAutoSave() == 'true';

    return {
        autoSave,
        setAutoSave: (autoSave) => {
            setLocalStorageAutoSave(autoSave.toString());
            set({ autoSave });
        },
    };
});

interface DevModeStore {
    devMode: boolean;
    setDevMode: (devMode: boolean) => void;
}

export const useDevModeStore = create<DevModeStore>((set) => {
    const stored = getLocalStorageDevMode();
    const devMode = stored === 'true';

    return {
        devMode,
        setDevMode: (devMode: boolean) => {
            setLocalStorageDevMode(devMode.toString());
            set({ devMode });
        },
    };
});
