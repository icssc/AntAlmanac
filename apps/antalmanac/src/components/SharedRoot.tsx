import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { GlobalStyles, Paper, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ScheduleCalendar } from './Calendar/CalendarRoot';
import AddedCoursePane from './RightPane/AddedCourses/AddedCoursePane';
import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';

import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { getLocalStorageUserId } from '$lib/localStorage';
import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

const UCIMap = lazy(() => import('./Map/Map'));

/**
 * Information about the tab navigation buttons.
 *
 * Each button should be associated with a different aspect of schedule management.
 */
type ScheduleManagementTabInfo = {
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

/**
 */
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

/**
 * For mobile devices, all tabs will be displayed.
 */
function ScheduleManagementMobileTabs() {
    const isDark = useThemeStore((store) => store.isDark);
    const { activeTab, setActiveTabValue } = useTabStore();

    const onChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTabValue(value);
    };

    return (
        <Tabs value={activeTab} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
            {scheduleManagementTabs.map((tab) => (
                <Tab
                    key={tab.label}
                    sx={{
                        ...(isDark ? { '&.Mui-selected': { color: 'white' } } : {}),
                    }}
                    label={
                        <Stack direction="column" alignItems="center" paddingBottom={1} gap={0.25}>
                            <tab.icon sx={{ fontSize: 20 }} />
                            <Typography textTransform="none" sx={{ fontSize: 9 }}>
                                {tab.label}
                            </Typography>
                        </Stack>
                    }
                />
            ))}
        </Tabs>
    );
}

/**
 * For desktop, some of the tabs will be displayed on the other side.
 * i.e. the calendar takes up the left side of the screen.
 */
function ScheduleManagementDesktopTabs() {
    const { activeTab, setActiveTabValue } = useTabStore();
    const theme = useTheme();
    const isDark = useThemeStore((store) => store.isDark);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const onChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTabValue(value);
    };

    return (
        <Tabs value={activeTab} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
            {scheduleManagementTabs.map((tab) => {
                return (
                    <Tab
                        key={tab.label}
                        id={tab.id}
                        to={tab.href}
                        component={Link}
                        sx={{
                            minHeight: 'auto',
                            height: '44px',
                            padding: 3,
                            minWidth: '33%',
                            ...(isDark ? { '&.Mui-selected': { color: 'white' } } : {}),
                            display: !isMobile && tab.mobile ? 'none' : 'flex',
                        }}
                        label={
                            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <tab.icon style={{ height: 16 }} />
                                <Typography variant="body2">{tab.label}</Typography>
                            </div>
                        }
                    />
                );
            })}
        </Tabs>
    );
}

function ScheduleManagementTabsContent() {
    const { activeTab } = useTabStore();
    const isDark = useThemeStore((store) => store.isDark);

    switch (activeTab) {
        case 0:
            return <ScheduleCalendar />;
        case 1:
            return <CoursePaneRoot />;
        case 2:
            return <AddedCoursePane />;
        case 3:
            return (
                <Suspense
                    fallback={
                        <div
                            style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <img src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading map" />
                        </div>
                    }
                >
                    <UCIMap />
                </Suspense>
            );

        default:
            return null;
    }
}

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export default function ScheduleManagement() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { activeTab, setActiveTab } = useTabStore();

    // Tab index mapped to the last known scrollTop.
    const [positions, setPositions] = useState<Record<number, number>>({});

    /**
     * Ref to the scrollable container with all of the tabs-content within it.
     */
    const ref = useRef<HTMLDivElement>(null);

    // Save the current scroll position to the store.
    const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const positionToSave = e.currentTarget.scrollTop;
        setPositions((current) => {
            current[activeTab] = positionToSave;
            return current;
        });
    };

    // Change the tab to the "added classes" tab if the user was previously logged in.
    useEffect(() => {
        const userId = getLocalStorageUserId();

        if (userId === null) {
            setActiveTab('search');
        } else if (isMobile) {
            setActiveTab('calendar');
        } else {
            setActiveTab('added');
        }
    }, [setActiveTab]);

    // Restore scroll position if it has been previously saved.
    useEffect(() => {
        const savedPosition = positions[activeTab];

        const animationFrame = requestAnimationFrame(() => {
            if (ref.current && savedPosition != null) {
                ref.current.scrollTop = savedPosition;
            }
        });

        return () => {
            if (animationFrame != null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [activeTab, positions]);

    return (
        <Stack direction="column" flexGrow={1} height="0">
            <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />

            {!isMobile && (
                <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                    <ScheduleManagementDesktopTabs />
                </Paper>
            )}

            <Stack width="100%" height="0" flexGrow={1} padding={1}>
                <Stack
                    id="course-pane-box"
                    direction="column"
                    overflow="auto"
                    height="0px"
                    flexGrow={1}
                    ref={ref}
                    onScroll={onScroll}
                >
                    <ScheduleManagementTabsContent />
                </Stack>
            </Stack>

            {isMobile && (
                <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                    <ScheduleManagementMobileTabs />
                </Paper>
            )}
        </Stack>
    );
}
