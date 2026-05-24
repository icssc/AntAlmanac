import { create } from 'zustand';

type TabName = 'calendar' | 'search' | 'added' | 'map';

const TabMap: Record<TabName, number> = {
    calendar: 0,
    search: 1,
    added: 2,
    map: 3,
};

interface TabStore {
    activeTab: number;

    /**
     * Sets the appropriate tab value given a string literal union
     */
    setActiveTab: (name: TabName) => void;

    /**
     * Sets the appropriate tab value given a tab index.
     *
     * `setActiveTab` (which accepts a string literal union) should be preferred if trying to change tabs programmatically (and not as part of an event handler)
     */
    setActiveTabValue: (value: number) => void;
}

export const useTabStore = create<TabStore>((set) => {
    return {
        activeTab: 1,
        setActiveTab: (name: TabName) => {
            set(() => ({
                activeTab: TabMap[name],
            }));
        },
        setActiveTabValue: (value: number) => {
            set(() => ({ activeTab: value }));
        },
    };
});
