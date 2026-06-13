'use client';

import { createContext, useContext } from 'react';

interface DeviceContextValue {
    isMobile: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({ isMobile: false });

export function DeviceProvider({ isMobile, children }: { isMobile: boolean; children: React.ReactNode }) {
    return <DeviceContext.Provider value={{ isMobile }}>{children}</DeviceContext.Provider>;
}

export function useDeviceHint() {
    return useContext(DeviceContext);
}
