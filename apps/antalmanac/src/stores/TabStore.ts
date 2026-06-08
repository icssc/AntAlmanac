import { Event, FormatListBulleted, MyLocation, Search, type SvgIconComponent } from '@mui/icons-material';
import { create } from 'zustand';

export const TABS = [
    {
        name: 'calendar',
        label: 'Calendar',
        icon: Event,
        mobileOnly: true,
        href: '/calendar',
    },
    {
        name: 'search',
        label: 'Search',
        href: '/',
        icon: Search,
    },
    {
        name: 'added',
        label: 'Added',
        href: '/added',
        icon: FormatListBulleted,
        id: 'added-courses-tab',
    },
    {
        name: 'map',
        label: 'Map',
        href: '/map',
        icon: MyLocation,
        id: 'map-tab',
    },
] as const;

type TabName = (typeof TABS)[number]['name'];

export type TabInfo = {
    name: TabName;
    label: string;
    href: string;
    icon: SvgIconComponent;
    id?: string;
    mobileOnly?: true;
};

export const TAB_INDEX = Object.fromEntries(TABS.map((tab, index) => [tab.name, index])) as Record<TabName, number>;

interface TabStore {
    activeTab: number;
    setActiveTab: (name: TabName) => void;
    setActiveTabValue: (value: number) => void;
}

export const useTabStore = create<TabStore>((set) => {
    return {
        activeTab: TAB_INDEX.search,
        setActiveTab: (name: TabName) => {
            set(() => ({
                activeTab: TAB_INDEX[name],
            }));
        },
        setActiveTabValue: (value: number) => {
            set(() => ({ activeTab: value }));
        },
    };
});
