import { useParams } from 'react-router-dom';
import React, { useEffect, useState, createContext, Suspense } from 'react';
import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { Event, FormatListBulleted, MyLocation, Search } from '@material-ui/icons';

import AddedCoursePane from '../components/RightPane/AddedCourses/AddedCoursePane';
import CoursePane from '../components/RightPane/CoursePane/CoursePaneRoot';

import darkModeLoadingGif from './RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import Calendar from './Calendar/CalendarRoot';
import { useThemeStore } from '$stores/SettingsStore';

const UCIMap = React.lazy(() => import('../components/Map/Map'));

const styles = {
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

interface TabInfo {
    label: string;
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
        icon: Search,
    },
    {
        label: 'Added',
        icon: FormatListBulleted,
        id: 'added-courses-tab',
    },
    {
        label: 'Map',
        icon: MyLocation,
        id: 'map-tab',
    },
];

const Views = ({ selectedTab }: { selectedTab: number }) => {
    const isDark = useThemeStore((store) => store.isDark);

    return selectedTab === 0 ? (
        <Calendar isMobile={true} />
    ) : (
        <Box height="100%" style={{ margin: '0 4px' }}>
            <Box height="calc(100% - 54px)" overflow="auto" style={{ margin: '8px 4px 0px' }} id="course-pane-box">
                {selectedTab === 1 && <CoursePane />}
                {selectedTab === 2 && <AddedCoursePane />}
                {selectedTab === 3 && (
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

export type MobileContext = {
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
};

export const mobileContext = createContext<MobileContext>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setSelectedTab: () => {},
});

const MobileHome = () => {
    const [selectedTab, setSelectedTab] = useState(localStorage.getItem('userID') ? 0 : 1);
    const params = useParams();

    useEffect(() => {
        if (params.tab === 'map') {
            setSelectedTab(1);
        }
    }, [params, setSelectedTab]);

    return (
        <div style={{ height: 'calc(100% - 60px)' }}>
            <Paper elevation={0} variant="outlined" square style={{ margin: '4px', height: '50px' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(_, value: number) => {
                        setSelectedTab(value);
                    }}
                    indicatorColor="primary"
                    variant="fullWidth"
                    centered
                    style={{
                        height: '100%',
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            label={
                                <Box
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <tab.icon style={{ width: '100%', fontSize: '24px' }} />
                                    <Typography style={{ fontSize: '10px' }}>{tab.label}</Typography>
                                </Box>
                            }
                            style={{ paddingTop: 0, paddingBottom: 0 }}
                            key={tab.label}
                        />
                    ))}
                </Tabs>
            </Paper>
            <mobileContext.Provider value={{ setSelectedTab }}>
                {<Views selectedTab={selectedTab} />}
            </mobileContext.Provider>
        </div>
    );
};

export default MobileHome;
