import { create } from 'zustand';

type TabName = 'calendar' | 'search' | 'added' | 'map';

interface TabStore {
    activeTab: number;

    /**
     * Sets the appropriate tab value given a string literal union
     */
    setActiveTab: (value: TabName) => void;

    /**
     * Sets the appropriate tab value given a tab index.
     *
     * `setActiveTab` (which accepts a string literal union) should be preferred if trying to change tabs programmatically (and not as part of an event handler)
     */
    setActiveTabValue: (value: number) => void;
}

export const useTabStore = create<TabStore>((set) => {
    // const pathArray = typeof window !== 'undefined' ? window.location.pathname.split('/').slice(1) : [];
    // const tabName = pathArray[0];

    return {
        activeTab: 1,
        setActiveTab: (name: TabName) => {
            if (name === 'calendar') {
                set(() => ({
                    activeTab: 0,
                }));
            }

            if (name === 'search') {
                set(() => ({
                    activeTab: 1,
                }));
            }

            if (name === 'added') {
                set(() => ({
                    activeTab: 2,
                }));
            }

            if (name === 'map') {
                set(() => ({
                    activeTab: 3,
                }));
            }
        },
        setActiveTabValue: (value: number) => {
            set(() => ({ activeTab: value }));
        },
    };
});
