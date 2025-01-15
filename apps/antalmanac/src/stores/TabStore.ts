import { create } from 'zustand';

interface TabStore {
    activeTab: number;
    setActiveTab: (newTab: number) => void;
}

export const useTabStore = create<TabStore>((set) => {
    const pathArray = typeof window !== 'undefined' ? window.location.pathname.split('/').slice(1) : [];
    const tabName = pathArray[0];

    return {
        activeTab: tabName === 'added' ? 1 : tabName === 'map' ? 2 : 0,
        setActiveTab: (newTab: number) => {
            set(() => ({
                activeTab: newTab,
            }));
        },
    };
});
