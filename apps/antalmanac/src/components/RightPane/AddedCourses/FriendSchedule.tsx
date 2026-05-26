import { AddedSectionsGrid } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import darkModeLoadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import { FriendScheduleTabProvider, type FriendScheduleTab } from '$lib/schedule/FriendScheduleTabContext';
import { useThemeStore } from '$stores/SettingsStore';
import { FormatListBulleted, MyLocation, Search } from '@mui/icons-material';
import { Box, Paper, Stack, Tab, Tabs } from '@mui/material';
import Image from 'next/image';
import { lazy, Suspense, useState } from 'react';

const UCIMap = lazy(() => import('$components/Map/Map'));

const friendScheduleTabIndex: Record<FriendScheduleTab, number> = {
    search: 0,
    added: 1,
    map: 2,
};

export function FriendSchedule() {
    const [activeTab, setActiveTab] = useState<FriendScheduleTab>('added');
    const [mapLocationId, setMapLocationId] = useState<number | undefined>();
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <FriendScheduleTabProvider activeTab={activeTab} setActiveTab={setActiveTab}>
            <Stack direction="column" flexGrow={1} height="100%" minHeight={0}>
                <Paper
                    elevation={0}
                    variant="outlined"
                    square
                    sx={{
                        borderRadius: '4px 4px 0 0',
                        borderWidth: '1px 0px 1px 0px',
                        flexShrink: 0,
                    }}
                >
                    <Tabs
                        value={friendScheduleTabIndex[activeTab]}
                        indicatorColor="secondary"
                        textColor="secondary"
                        variant="fullWidth"
                        centered
                    >
                        <Tab
                            id="friend-search-tab"
                            icon={<Search />}
                            iconPosition="start"
                            label="Search"
                            sx={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '33%' }}
                            onClick={() => setActiveTab('search')}
                        />
                        <Tab
                            id="friend-added-courses-tab"
                            icon={<FormatListBulleted />}
                            iconPosition="start"
                            label="Added"
                            sx={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '33%' }}
                            onClick={() => setActiveTab('added')}
                        />
                        <Tab
                            id="friend-map-tab"
                            icon={<MyLocation />}
                            iconPosition="start"
                            label="Map"
                            sx={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '33%' }}
                            onClick={() => setActiveTab('map')}
                        />
                    </Tabs>
                </Paper>

                <Box
                    flexGrow={1}
                    minHeight={0}
                    overflow={activeTab === 'map' ? 'hidden' : 'auto'}
                    display="flex"
                    flexDirection="column"
                    padding={1}
                >
                    {activeTab === 'search' ? (
                        <CoursePaneRoot />
                    ) : activeTab === 'added' ? (
                        <AddedSectionsGrid />
                    ) : (
                        <Suspense
                            fallback={
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Image
                                        src={isDark ? darkModeLoadingGif : loadingGif}
                                        alt="Loading map"
                                        unoptimized
                                    />
                                </Box>
                            }
                        >
                            <UCIMap locationId={mapLocationId} onLocationChange={setMapLocationId} />
                        </Suspense>
                    )}
                </Box>
            </Stack>
        </FriendScheduleTabProvider>
    );
}
