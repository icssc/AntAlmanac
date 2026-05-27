import { AddedSectionsGrid } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import darkModeLoadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import { useFriendScheduleTab, type FriendScheduleTab } from '$lib/schedule/FriendScheduleTabContext';
import { useThemeStore } from '$stores/SettingsStore';
import { FormatListBulleted, MyLocation } from '@mui/icons-material';
import { Box, Paper, Stack, Tab, Tabs } from '@mui/material';
import Image from 'next/image';
import { lazy, Suspense } from 'react';

const UCIMap = lazy(() => import('$components/Map/Map'));

const friendScheduleTabIndex: Record<FriendScheduleTab, number> = {
    added: 0,
    map: 1,
};

export function FriendSchedule() {
    const friendScheduleTab = useFriendScheduleTab();
    const isDark = useThemeStore((store) => store.isDark);

    if (!friendScheduleTab) {
        return null;
    }

    const { activeTab, setActiveTab, mapLocationId, setMapLocationId } = friendScheduleTab;

    return (
        <Stack direction="column" flexGrow={1} height={0} minHeight={0} overflow="hidden">
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
                        id="friend-added-courses-tab"
                        icon={<FormatListBulleted />}
                        iconPosition="start"
                        label="Added"
                        sx={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '50%' }}
                        onClick={() => setActiveTab('added')}
                    />
                    <Tab
                        id="friend-map-tab"
                        icon={<MyLocation />}
                        iconPosition="start"
                        label="Map"
                        sx={{ minHeight: 'auto', height: '44px', padding: 3, minWidth: '50%' }}
                        onClick={() => setActiveTab('map')}
                    />
                </Tabs>
            </Paper>

            <Box
                flexGrow={1}
                height={0}
                minHeight={0}
                overflow={activeTab === 'map' ? 'hidden' : 'auto'}
                display="flex"
                flexDirection="column"
                padding={1}
                sx={{ WebkitOverflowScrolling: 'touch' }}
            >
                {activeTab === 'added' ? (
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
                                <Image src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading map" unoptimized />
                            </Box>
                        }
                    >
                        <UCIMap locationId={mapLocationId} onLocationChange={setMapLocationId} />
                    </Suspense>
                )}
            </Box>
        </Stack>
    );
}
