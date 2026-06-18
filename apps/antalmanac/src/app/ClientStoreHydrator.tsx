'use client';

import { hydrateDevModeStore } from '$stores/SettingsStore';
import { useEffect } from 'react';

export function ClientStoreHydrator({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        hydrateDevModeStore();
    }, []);

    return children;
}
