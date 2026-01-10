import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Paper, Tabs } from '@mui/material';

import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
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
    icon: React.ReactElement;

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
        icon: <Event />,
        mobile: true,
        href: '',
    },
    {
        label: 'Search',
        href: '/',
        icon: <Search />,
    },
    {
        label: 'Added',
        href: '/added',
        icon: <FormatListBulleted />,
        id: 'added-courses-tab',
    },
    {
        label: 'Map',
        href: '/map',
        icon: <MyLocation />,
        id: 'map-tab',
    },
];

export function ScheduleManagementTabs() {
    const { activeTab } = useTabStore();

    return (
        <Paper
            elevation={0}
            variant="outlined"
            square
            sx={{ borderRadius: '4px 4px 0 0', borderWidth: '1px 0px 1px 0px' }}
        >
            <Tabs value={activeTab} indicatorColor="primary" variant="fullWidth" centered>
                {scheduleManagementTabs.map((tab, index) => (
                    <ScheduleManagementTab key={tab.label} tab={tab} value={index} />
                ))}
            </Tabs>
        </Paper>
    );
}
