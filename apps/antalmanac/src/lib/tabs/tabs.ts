import { Event, FormatListBulleted, MyLocation, Search, type SvgIconComponent } from '@mui/icons-material';

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

export type TabName = (typeof TABS)[number]['name'];

export type TabInfo = {
    name: TabName;
    label: string;
    href: string;
    icon: SvgIconComponent;
    id?: string;
    mobileOnly?: true;
};

export const TAB_HREF = Object.fromEntries(TABS.map((tab) => [tab.name, tab.href])) as Record<TabName, string>;
