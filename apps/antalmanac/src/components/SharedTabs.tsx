import React, { Suspense, useEffect } from 'react';
import { Box, Paper, Tab, Tabs, Typography, useMediaQuery } from '@material-ui/core';
import { Event, FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import { Link, useParams } from 'react-router-dom';

import AddedCoursePane from './RightPane/AddedCourses/AddedCoursePane';
import CoursePane from './RightPane/CoursePane/CoursePaneRoot';

import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import Calendar from './Calendar/CalendarRoot';
import { useThemeStore } from '$stores/SettingsStore';
import useTabStore from '$stores/TabStore';

const UCIMap = React.lazy(() => import('./Map/Map'));

const styles = {
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const Views = ({ activeTab, mobile }: { activeTab: number; mobile: boolean }) => {
    const isDark = useThemeStore((store) => store.isDark);

    return activeTab === 0 ? (
        <Calendar isMobile={mobile} />
    ) : (
        <Box height="100%" style={{ margin: '0 4px' }}>
            <Box height="calc(100% - 54px)" overflow="auto" style={{ margin: '8px 4px 0px' }} id="course-pane-box">
                {activeTab === 1 && <CoursePane />}
                {activeTab === 2 && <AddedCoursePane />}
                {activeTab === 3 && (
                    <Suspense
                        fallback={
                            <div style={styles.fallback}>
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
};

interface TabInfo {
    label: string;
    href?: string;
    icon: React.ElementType;
    id?: string;
}

const tabs: Array<TabInfo> = [
    {
        label: 'Calendar',
        icon: Event,
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

const MobileTab = ({ tab }: { tab: TabInfo }) => {
    return (
        <Tab
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
            style={{ paddingTop: 0, paddingBottom: 0 }}
            key={tab.label}
        />
    );
};

const DesktopTab = (tab: TabInfo) => {
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
};

interface SharedTabsProps {
    style?: Record<string, unknown>;
    mobile: boolean;
}

const SharedTabs = ({ style, mobile }: SharedTabsProps) => {
    const { activeTab, setActiveTab } = useTabStore();

    const params = useParams();

    useEffect(() => {
        if (params.tab === 'map') {
            setActiveTab(1);
        }
    }, [params, setActiveTab]);

    useEffect(() => {
        localStorage.getItem('userID') ? setActiveTab(0) : setActiveTab(1);
    }, [setActiveTab]);

    return (
        <Box style={{ ...style, height: '100%' }}>
            <Paper elevation={0} variant="outlined" square style={{ margin: '4px', height: '50px' }}>
                <Tabs
                    value={mobile ? activeTab : activeTab - 1}
                    onChange={(_event, value) => setActiveTab(value)}
                    indicatorColor="primary"
                    variant="fullWidth"
                    centered
                    style={{
                        height: '100%',
                    }}
                >
                    {!mobile
                        ? tabs.slice(1).map((tab) => (
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
                          ))
                        : tabs.map((tab) => <MobileTab tab={tab} key={tab.label} />)}
                </Tabs>
            </Paper>

            <Views activeTab={activeTab} mobile={mobile} />
        </Box>
    );
};

export default SharedTabs;
