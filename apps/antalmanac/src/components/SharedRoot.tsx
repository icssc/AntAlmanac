import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { Event, FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import { GlobalStyles } from '@mui/material';
import { Suspense, lazy, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Calendar from './Calendar/CalendarRoot';
import AddedCoursePane from './RightPane/AddedCourses/AddedCoursePane';
import CoursePane from './RightPane/CoursePane/CoursePaneRoot';
import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';

import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

const UCIMap = lazy(() => import('./Map/Map'));

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
            <Box height="calc(100% - 54px)" overflow="auto" style={{ margin: '8px 0px' }} id="course-pane-box">
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

interface SharedTabsProps {
    style?: Record<string, unknown>;
    mobile: boolean;
}

const SharedTabs = ({ style, mobile }: SharedTabsProps) => {
    const { activeTab, setActiveTab } = useTabStore();

    const params = useParams();

    const getActiveTab = () => {
        return mobile ? activeTab : activeTab - 1 >= 0 ? activeTab - 1 : 0;
    };

    useEffect(() => {
        localStorage.getItem('userID') ? setActiveTab(2) : setActiveTab(1);
    }, [setActiveTab]);

    useEffect(() => {
        if (mobile) {
            return;
        }

        if (params.tab === 'map') {
            setActiveTab(3);
        }

        if (activeTab == 0) {
            setActiveTab(1);
        }
    }, [activeTab, mobile, params.tab, setActiveTab]);

    return (
        <Box style={{ ...style, height: 'calc(100vh - 58px)' }}>
            <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />
            <Paper
                elevation={0}
                variant="outlined"
                square
                style={{ margin: '0px 4px 4px', borderRadius: '4px 4px 0 0' }}
            >
                <Tabs
                    value={getActiveTab()}
                    onChange={(_event, value) => {
                        setActiveTab(mobile ? value : value + 1);
                    }}
                    indicatorColor="primary"
                    variant="fullWidth"
                    centered
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
                        : tabs.map((tab) => (
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
            </Paper>

            <Views activeTab={activeTab} mobile={mobile} />
        </Box>
    );
};

export default SharedTabs;
