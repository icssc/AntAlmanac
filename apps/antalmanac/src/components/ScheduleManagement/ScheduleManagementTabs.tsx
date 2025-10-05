import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Box, Paper, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';

import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
import store from '$stores/AppStore';
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

export function ScheduleManagementTabs() {
    const { activeTab } = useTabStore();
    const [hasAsync, setHasAsync] = useState(false);
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
            icon: hasAsync ? (
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            backgroundColor: 'orange',
                            zIndex: -1,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', opacity: 0.7 },
                                '50%': { transform: 'scale(1.3)', opacity: 0.3 },
                                '100%': { transform: 'scale(1)', opacity: 0.7 },
                            },
                        },
                    }}
                >
                    <FormatListBulleted sx={{ color: '#00AAAA' }} />
                </Box>
            ) : (
                <FormatListBulleted />
            ),
            id: 'added-courses-tab',
        },
        {
            label: 'Map',
            href: '/map',
            icon: <MyLocation />,
            id: 'map-tab',
        },
    ];

    useEffect(() => {
        const updateAsync = () => {
            let hasAsyncCourse = false;
            const courses = store.getAddedCourses();
            console.log('in the fuction');
            console.log(courses);

            courses.forEach((course) => {
                if (course.section.meetings[0].timeIsTBA) {
                    console.log("WE've FOUND ONE");
                    hasAsyncCourse = true;
                }
            });
            setHasAsync(hasAsyncCourse);
        };

        store.on('addedCoursesChange', updateAsync);
        return () => {
            store.off('addedCoursesChange', updateAsync);
        };
    }, []);

    return (
        <div>
            <h1>BEN LOOK EHRE</h1>
            <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                <Tabs value={activeTab} indicatorColor="primary" variant="fullWidth" centered>
                    {scheduleManagementTabs.map((tab, index) => (
                        <ScheduleManagementTab key={tab.label} tab={tab} value={index} />
                    ))}
                </Tabs>
            </Paper>
        </div>
    );
}
