import { create } from 'zustand';

interface AppInitState {
    hasCheckedAuth: boolean;
    setHasCheckedAuth: (hasCheckedAuth: boolean) => void;

    isNewUser: boolean;
    setIsNewUser: (isNewUser: boolean) => void;

    areSchedulesLoaded: boolean;
    setAreSchedulesLoaded: (areSchedulesLoaded: boolean) => void;
}

export const useAppInitStore = create<AppInitState>((set) => ({
    hasCheckedAuth: false,
    isNewUser: false,
    areSchedulesLoaded: false,

    setHasCheckedAuth: (hasCheckedAuth) => set({ hasCheckedAuth }),
    setIsNewUser: (isNewUser) => set({ isNewUser }),
    setAreSchedulesLoaded: (areSchedulesLoaded) => set({ areSchedulesLoaded }),
}));
