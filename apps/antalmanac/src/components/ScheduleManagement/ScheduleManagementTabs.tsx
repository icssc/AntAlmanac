import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Paper, Tabs } from '@mui/material';
import { useEffect } from 'react';

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
    // const { hasAsync, setHasAsync } = useState(false);
    useEffect(() => {
        return;
    }, []);

    return (
        <div>
            <h1>BEN LOOK EHRE</h1>
            <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                <h1> afte rsome outlined stuff</h1>
                <Tabs value={activeTab} indicatorColor="primary" variant="fullWidth" centered>
                    <h1>WE IN HERE NOW</h1>
                    {scheduleManagementTabs.map((tab, index) => (
                        <>
                            <h2>11111</h2>
                            <ScheduleManagementTab key={tab.label} tab={tab} value={index} />
                        </>
                    ))}
                </Tabs>
            </Paper>
        </div>
    );
}
