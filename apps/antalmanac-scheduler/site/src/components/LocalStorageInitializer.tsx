import { useDevModeStore } from '$stores/SettingsStore';
import { useEffect } from 'react';

export const LocalStorageInitializer = () => {
    const initDevMode = useDevModeStore((state) => state.initDevMode);

    useEffect(() => {
        initDevMode();
    }, [initDevMode]);

    return null;
};
