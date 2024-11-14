import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { GlobalStyles, Paper, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Calendar from './Calendar/CalendarRoot';
import AddedCoursePane from './RightPane/AddedCourses/AddedCoursePane';
import CoursePane from './RightPane/CoursePane/CoursePaneRoot';
import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';

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
 * A different set of tab buttons will be listed depending on whether the screen is mobile or
 * desktop.
 *
 * Provide the current state of the tab navigation from the parent.
 */
type ScheduleManagementTabsProps = {
    value: number;
    setActiveTab: (value: number) => void;
};

/**
 * For mobile devices, all tabs will be displayed.
 */
function ScheduleManagementMobileTabs(props: ScheduleManagementTabsProps) {
    const { value, setActiveTab } = props;
    const isDark = useThemeStore((store) => store.isDark);

    const onChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTab(value);
    };

    return (
        <Tabs value={value} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
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
function ScheduleManagementDesktopTabs(props: ScheduleManagementTabsProps) {
    const { value, setActiveTab } = props;
    const isDark = useThemeStore((store) => store.isDark);

    const onChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTab(value + 1);
    };

    return (
        <Tabs value={value} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
            {scheduleManagementTabs.map((tab) => {
                if (tab.mobile) return;

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

function ScheduleManagementTabsContent(props: { activeTab: number; isMobile: boolean }) {
    const { activeTab, isMobile } = props;

    const isDark = useThemeStore((store) => store.isDark);

    switch (activeTab) {
        case 0:
            return <Calendar isMobile={isMobile} />;
        case 1:
            return <CoursePane />;
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

    const { tab } = useParams();

    // Tab index mapped to the last known scrollTop.
    const [positions, setPositions] = useState<Record<number, number>>({});

    /**
     * Ref to the scrollable container with all of the tabs-content within it.
     */
    const ref = useRef<HTMLDivElement>();

    const value = isMobile ? activeTab : activeTab - 1 >= 0 ? activeTab - 1 : 0;

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

        if (userId != null) {
            setActiveTab(2);
        } else {
            setActiveTab(1);
        }
    }, []);

    // Handle tab index for mobile screens.
    useEffect(() => {
        if (isMobile) return;

        if (tab === 'map') {
            setActiveTab(3);
        }

        if (activeTab == 0) {
            setActiveTab(1);
        }
    }, [activeTab, isMobile, tab]);

    // Restore scroll position if it has been previously saved.
    useEffect(() => {
        const savedPosition = positions[activeTab];

        let animationFrame: number;

        if (savedPosition != null) {
            animationFrame = requestAnimationFrame(() => {
                if (ref.current) {
                    ref.current.scrollTop = savedPosition;
                }
            });
        }

        return () => {
            if (animationFrame != null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [activeTab, positions]);

    if (activeTab === 0 && !isMobile) {
        return <Calendar isMobile={isMobile} />;
    }

    return (
        <Stack direction="column" flexGrow={1} height="0">
            <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />

            {!isMobile && (
                <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                    <ScheduleManagementDesktopTabs value={value} setActiveTab={setActiveTab} />
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
                    <ScheduleManagementTabsContent activeTab={activeTab} isMobile={isMobile} />
                </Stack>
            </Stack>

            {isMobile && (
                <Paper elevation={0} variant="outlined" square sx={{ borderRadius: '4px 4px 0 0' }}>
                    <ScheduleManagementMobileTabs value={value} setActiveTab={setActiveTab} />
                </Paper>
            )}
        </Stack>
    );
}
