import { create } from 'zustand';
import useColumnStore from './ColumnStore';

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
            // Disable GPA column on the Added tab because we'd have to query them individually
            // A column needs to be enabled and selected to be displayed
            if (newTab == 1) {
                useColumnStore.getState().setColumnEnabled('gpa', false);
            } else {
                useColumnStore.getState().setColumnEnabled('gpa', true);
            }
        },
    };
});

export default useTabStore;
