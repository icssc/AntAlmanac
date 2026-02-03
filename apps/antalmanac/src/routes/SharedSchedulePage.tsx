import { Add, Close } from '@mui/icons-material';
import { useMediaQuery, useTheme, Stack, Alert, Button, Box, Typography, IconButton } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import type {
    ScheduleSaveState,
    ShortCourseSchedule,
    ShortCourse,
    RepeatingCustomEvent,
} from '@packages/antalmanac-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Split from 'react-split';

import { importSharedScheduleById, openSnackbar } from '$actions/AppStoreActions';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
import { HelpMenu } from '$components/HelpMenu/HelpMenu';
import InstallPWABanner from '$components/InstallPWABanner';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import trpc from '$lib/api/trpc';
import { removeLocalStorageUnsavedActions } from '$lib/localStorage';
import { getDefaultTerm } from '$lib/termData';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { useSessionStore } from '$stores/SessionStore';

function MobileSharedSchedule() {
    return <ScheduleManagement />;
}

function DesktopSharedSchedule() {
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const scheduleManagementRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback(() => {
        const scheduleManagementElement = scheduleManagementRef.current;
        if (!scheduleManagementElement) {
            return;
        }

        const elementWidth = scheduleManagementElement.getBoundingClientRect().width;
        setScheduleManagementWidth(elementWidth);
    }, [setScheduleManagementWidth]);

    useEffect(() => {
        handleDrag();

        window.addEventListener('resize', handleDrag);

        return () => {
            window.removeEventListener('resize', handleDrag);
        };
    }, [handleDrag]);

    return (
        <Split
            sizes={[45, 55]}
            minSize={400}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', flexGrow: 1, marginTop: 4 }}
            gutterStyle={() => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            })}
            onDrag={handleDrag}
        >
            <Stack direction="column">
                <ScheduleCalendar />
            </Stack>
            <Stack direction="column" ref={scheduleManagementRef}>
                <ScheduleManagement />
            </Stack>
        </Split>
    );
}

export function SharedSchedulePage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const { sessionIsValid } = useSessionStore();
    const { setOpenLoadingSchedule } = scheduleComponentsToggleStore();
    const [error, setError] = useState<string | null>(null);
    const [scheduleName, setScheduleName] = useState<string | null>(null);
    const hasAttemptedLoadRef = useRef(false);
    const currentScheduleIdRef = useRef<string | undefined>(scheduleId);

    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (currentScheduleIdRef.current !== scheduleId) {
            hasAttemptedLoadRef.current = false;
            currentScheduleIdRef.current = scheduleId;
        }

        if (hasAttemptedLoadRef.current) {
            return;
        }

        const loadSharedSchedule = async () => {
            if (!scheduleId) {
                setError('Invalid schedule ID');
                setOpenLoadingSchedule(false);
                hasAttemptedLoadRef.current = true;
                return;
            }

            hasAttemptedLoadRef.current = true;

            try {
                setOpenLoadingSchedule(true);
                setError(null);

                removeLocalStorageUnsavedActions();

                if (AppStore.getSkeletonMode()) {
                    AppStore.exitSkeletonMode();
                }

                const sharedSchedule = await trpc.userData.getSharedSchedule.query({
                    scheduleId,
                });

                const scheduleSaveState = {
                    schedules: [
                        {
                            id: sharedSchedule.id,
                            scheduleName: sharedSchedule.scheduleName,
                            scheduleNote: sharedSchedule.scheduleNote || '',
                            courses: sharedSchedule.courses,
                            customEvents: sharedSchedule.customEvents,
                        },
                    ],
                    scheduleIndex: 0,
                };

                const loadSuccess = await AppStore.loadSchedule(scheduleSaveState);

                if (!loadSuccess) {
                    throw new Error('Failed to load shared schedule');
                }
                if (AppStore.getCurrentScheduleIndex() !== 0) {
                    AppStore.changeCurrentSchedule(0);
                }
                AppStore.skeletonMode = true;
                AppStore.emit('skeletonModeChange');
                setScheduleName(sharedSchedule.scheduleName);
                setOpenLoadingSchedule(false);
            } catch (err) {
                console.error('Error loading shared schedule:', err);
                setError('Failed to load shared schedule. It may not exist or may have been deleted.');
                setOpenLoadingSchedule(false);
            }
        };

        loadSharedSchedule();

        return () => {
            setOpenLoadingSchedule(false);
        };
    }, [scheduleId, setOpenLoadingSchedule]);

    const handleExitSharedSchedule = useCallback(async () => {
        try {
            setOpenLoadingSchedule(true);

            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }

            if (sessionIsValid) {
                const sessionToken = useSessionStore.getState().session;

                if (sessionToken) {
                    const userDataResponse = await trpc.userData.getUserDataWithSession.query({
                        refreshToken: sessionToken,
                    });
                    const scheduleSaveState =
                        (userDataResponse as { userData?: ScheduleSaveState }).userData ?? userDataResponse;

                    if (scheduleSaveState) {
                        await AppStore.loadSchedule(scheduleSaveState as ScheduleSaveState);
                    }
                }
            } else {
                const defaultTerm = getDefaultTerm();
                const emptyScheduleData = {
                    scheduleName: defaultTerm.shortName.replaceAll(' ', '-'),
                    courses: [] as ShortCourse[],
                    customEvents: [] as RepeatingCustomEvent[],
                    scheduleNote: '',
                } as ShortCourseSchedule;
                const emptySchedule: ScheduleSaveState = {
                    schedules: [emptyScheduleData],
                    scheduleIndex: 0,
                };
                await AppStore.loadSchedule(emptySchedule);
            }

            setOpenLoadingSchedule(false);
            navigate('/');
        } catch (err) {
            console.error('Error exiting shared schedule:', err);
            setOpenLoadingSchedule(false);
            navigate('/');
        }
    }, [navigate, sessionIsValid, setOpenLoadingSchedule]);

    const handleLoadSchedule = useCallback(async (sessionToken?: string) => {
        if (sessionToken) {
            const userDataResponse = await trpc.userData.getUserDataWithSession.query({
                refreshToken: sessionToken,
            });
            const scheduleSaveState =
                (userDataResponse as { userData?: ScheduleSaveState }).userData ?? userDataResponse;

            if (scheduleSaveState) {
                await AppStore.loadSchedule(scheduleSaveState as ScheduleSaveState);
            }
        } else {
            const defaultTerm = getDefaultTerm();
            const emptyScheduleData = {
                scheduleName: defaultTerm.shortName.replaceAll(' ', '-'),
                courses: [] as ShortCourse[],
                customEvents: [] as RepeatingCustomEvent[],
                scheduleNote: '',
            } as ShortCourseSchedule;
            const emptySchedule: ScheduleSaveState = {
                schedules: [emptyScheduleData],
                scheduleIndex: 0,
            };
            await AppStore.loadSchedule(emptySchedule);
        }
    }, []);

    const handleAddToMySchedules = useCallback(async () => {
        if (!scheduleId) {
            return;
        }

        try {
            setOpenLoadingSchedule(true);

            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }

            if (sessionIsValid) {
                const sessionToken = useSessionStore.getState().session;
                if (!sessionToken) {
                    throw new Error('No session token available');
                }

                await handleLoadSchedule(sessionToken);
                await importSharedScheduleById(scheduleId);
            } else {
                const currentSchedules = AppStore.schedule.getScheduleAsSaveState();
                const sharedSchedule = await trpc.userData.getSharedSchedule.query({ scheduleId });
                const currentSchedule = currentSchedules.schedules[currentSchedules.scheduleIndex];

                if (currentSchedule && currentSchedule.scheduleName === sharedSchedule.scheduleName) {
                    const prefixedName = `(shared)-${sharedSchedule.scheduleName}`;
                    AppStore.renameSchedule(currentSchedules.scheduleIndex, prefixedName);
                    openSnackbar(
                        'success',
                        `Shared schedule "${sharedSchedule.scheduleName}" added to your schedules!`
                    );
                } else {
                    await importSharedScheduleById(scheduleId);
                }
            }

            setOpenLoadingSchedule(false);
            navigate('/');
        } catch (err) {
            console.error('Error adding schedule to account:', err);
            setOpenLoadingSchedule(false);
            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }
            navigate('/');
        }
    }, [scheduleId, sessionIsValid, navigate, setOpenLoadingSchedule, handleLoadSchedule]);

    const handleGoHome = useCallback(async () => {
        try {
            setOpenLoadingSchedule(true);

            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }

            const sessionToken = useSessionStore.getState().session;

            if (!sessionToken) {
                throw new Error('No session token available');
            }

            await handleLoadSchedule(sessionToken);

            setOpenLoadingSchedule(false);
            navigate('/');
        } catch (err) {
            console.error('Error loading user data:', err);
            setOpenLoadingSchedule(false);
            navigate('/');
        }
    }, [navigate, setOpenLoadingSchedule, handleLoadSchedule]);

    if (error) {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack component="main" height="100dvh" justifyContent="center" alignItems="center" spacing={2}>
                    <Alert severity="error">{error}</Alert>
                    <Button variant="contained" onClick={handleGoHome}>
                        Go Home
                    </Button>
                </Stack>
            </LocalizationProvider>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <PatchNotes />
            <InstallPWABanner />

            <Stack component="main" height="100dvh">
                <Header />
                {scheduleName && (
                    <Box
                        sx={{
                            px: 2,
                            py: isMobileScreen ? 0.5 : 1,
                            backgroundColor: 'background.paper',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Stack
                            direction={'row'}
                            justifyContent="space-between"
                            alignItems={'center'}
                            spacing={isMobileScreen ? 1 : 0}
                        >
                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    fontSize: isMobileScreen ? '1rem' : undefined,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Viewing Shared Schedule:{' '}
                                <strong style={{ whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>{scheduleName}</strong>
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                {isMobileScreen ? (
                                    <IconButton
                                        aria-label="Add to My Schedules"
                                        onClick={handleAddToMySchedules}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'primary.dark',
                                            color: 'white',
                                            borderRadius: 2,
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        <Add />
                                    </IconButton>
                                ) : (
                                    <Button variant="contained" onClick={handleAddToMySchedules} size="large">
                                        Add to My Schedules
                                    </Button>
                                )}
                                <IconButton
                                    aria-label="Exit shared schedule"
                                    onClick={handleExitSharedSchedule}
                                    color="inherit"
                                    size={isMobileScreen ? 'medium' : 'large'}
                                >
                                    <Close />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Box>
                )}
                {isMobileScreen ? <MobileSharedSchedule /> : <DesktopSharedSchedule />}
            </Stack>

            <NotificationSnackbar />
            <HelpMenu />
        </LocalizationProvider>
    );
}
