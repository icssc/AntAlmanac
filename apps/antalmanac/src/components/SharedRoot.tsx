import { Event, FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Box, GlobalStyles, Paper, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { create } from 'zustand';


import Calendar from './Calendar/CalendarRoot';
import AddedCoursePane from './RightPane/AddedCourses/AddedCoursePane';
import CoursePane from './RightPane/CoursePane/CoursePaneRoot';
import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';

import { getLocalStorageUserId } from '$lib/localStorage';
import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';


const UCIMap = lazy(() => import('./Map/Map'));

type ScrollPositionStore = {
    positions: Record<number, number>;
    setPosition: (index: number, value: number) => void;
};

const useScrollPositionStore = create<ScrollPositionStore>((set) => {
    return {
        positions: {},
        setPosition: (index, value) => {
            set((current) => {
                current.positions[index] = value;
                return current;
            });
        },
    };
});

type TabsContentProps = {
    activeTab: number;
    isMobile: boolean;
};

function TabsContent(props: TabsContentProps) {
    const { activeTab, isMobile } = props;

    const isDark = useThemeStore((store) => store.isDark);

    const scrollPosition = useScrollPositionStore();

    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        const savedPosition = scrollPosition.positions[activeTab];
        if (savedPosition != null) {
            ref.current?.scrollTo(0, savedPosition);
        }

        return () => {
            const positionToSave = ref.current?.scrollTop;
            if (positionToSave != null) {
                scrollPosition.setPosition(activeTab, positionToSave);
            }
        };
    }, []);

    return activeTab === 0 ? (
        <Calendar isMobile={isMobile} />
    ) : (
        <Box height="100%" style={{ margin: '0 4px' }}>
            <Box
                ref={ref}
                height="calc(100% - 54px)"
                overflow="auto"
                style={{ margin: '8px 0px' }}
                id="course-pane-box"
            >
                {activeTab === 1 && <CoursePane />}
                {activeTab === 2 && <AddedCoursePane />}
                {activeTab === 3 && (
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
                )}
            </Box>
        </Box>
    );
}

interface TabInfo {
    label: string;
    href?: string;
    icon: React.ElementType;
    id?: string;
    mobile?: true;
}

const tabs: Array<TabInfo> = [
    {
        label: 'Calendar',
        icon: Event,
        mobile: true,
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

type ResponsiveTabProps = {
    value: any;
    setActiveTab: (value: any) => void;
};

function MobileTabs(props: ResponsiveTabProps) {
    const { value, setActiveTab } = props;

    const onChange = (_event: React.SyntheticEvent, value: any) => {
        setActiveTab(value);
    };

    return (
        <Tabs value={value} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
            {tabs.map((tab) => (
                <Tab
                    key={tab.label}
                    label={
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <tab.icon style={{ width: '100%', fontSize: '22px' }} />
                            <Typography style={{ fontSize: '10px' }}>{tab.label}</Typography>
                        </Box>
                    }
                    style={{ minWidth: '25%' }}
                />
            ))}
        </Tabs>
    );
}

function DesktopTabs(props: ResponsiveTabProps) {
    const { value, setActiveTab } = props;

    const onChange = (_event: React.SyntheticEvent, value: any) => {
        setActiveTab(value + 1);
    };

    return (
        <Tabs value={value} onChange={onChange} indicatorColor="primary" variant="fullWidth" centered>
            {tabs.map((tab) => {
                if (tab.mobile) return;

                return (
                    <Tab
                        key={tab.label}
                        component={Link}
                        label={
                            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <tab.icon style={{ height: 16 }} />
                                <Typography variant="body2">{tab.label}</Typography>
                            </div>
                        }
                        to={tab.href ?? ''}
                        style={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '33%' }}
                        id={tab.id}
                    />
                );
            })}
        </Tabs>
    );
}

function SharedTabs() {
    const isMobile = useMediaQuery('(max-width: 750px)');

    const { activeTab, setActiveTab } = useTabStore();

    const { tab } = useParams();

    useEffect(() => {
        getLocalStorageUserId() ? setActiveTab(2) : setActiveTab(1);
    }, []);

    useEffect(() => {
        if (isMobile) {
            return;
        }

        if (tab === 'map') {
            setActiveTab(3);
        }

        if (activeTab == 0) {
            setActiveTab(1);
        }
    }, [activeTab, isMobile, tab]);

    const value = isMobile ? activeTab : activeTab - 1 >= 0 ? activeTab - 1 : 0;

    return (
        <Box style={{ height: 'calc(100vh - 58px)' }}>
            <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />
            <Paper
                elevation={0}
                variant="outlined"
                square
                style={{ margin: '0px 4px 4px', borderRadius: '4px 4px 0 0' }}
            >
                {isMobile ? (
                    <MobileTabs value={value} setActiveTab={setActiveTab} />
                ) : (
                    <DesktopTabs value={value} setActiveTab={setActiveTab} />
                )}
            </Paper>

            <TabsContent activeTab={activeTab} isMobile={isMobile} />
        </Box>
    );
}

export default SharedTabs;
