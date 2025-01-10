import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Paper, SxProps, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

/**
 * Information about the tab navigation buttons.
 *
 * Each button should be associated with a different aspect of schedule management.
 */
export type ScheduleManagementTabInfo = {
    /**
     * Label to display on the tab button.
     */
    label: string;

    /**
     * The path to navigate to in the URL.
     */
    href: string;

    /**
     * Icon to display.
     */
    icon: React.ElementType;

    /**
     * ID for the tab?
     */
    id?: string;

    /**
     * Whether or not this is mobile-only.
     */
    mobile?: true;
};

const scheduleManagementTabs: Array<ScheduleManagementTabInfo> = [
    {
        label: 'Calendar',
        icon: Event,
        mobile: true,
        href: '',
    },
    {
        label: 'Search',
        href: '/',
        icon: Search,
    },
    {
        label: 'Added',
        href: '/added',
        icon: FormatListBulleted,
        id: 'added-courses-tab',
    },
    {
        label: 'Map',
        href: '/map',
        icon: MyLocation,
        id: 'map-tab',
    },
];

interface ScheduleManagementTabsProps {
    sx?: SxProps;
    label: (tab: ScheduleManagementTabInfo) => React.ReactNode;
}

export function ScheduleManagementTabs({ sx, label }: ScheduleManagementTabsProps) {
    const { activeTab, setActiveTabValue } = useTabStore();
    const isDark = useThemeStore((store) => store.isDark);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const onChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTabValue(value);
    };

    return (
        <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
            <Tabs value={activeTab} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
                {scheduleManagementTabs.map((tab) => {
                    return (
                        <Tab
                            key={tab.label}
                            id={tab.id}
                            component={Link}
                            to={tab.href}
                            sx={{
                                ...sx,
                                display: !isMobile && tab.mobile ? 'none' : 'flex',
                                ...(isDark ? { '&.Mui-selected': { color: 'white' } } : {}),
                            }}
                            label={label(tab)}
                        />
                    );
                })}
            </Tabs>
        </Paper>
    );
}

// sx={{ display: !isMobile && tab.mobile ? 'none' : 'flex' }}
