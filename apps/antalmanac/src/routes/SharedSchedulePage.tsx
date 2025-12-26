import { useMediaQuery, useTheme, Stack, Alert, Button, Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Split from 'react-split';

import { importSharedScheduleById } from '$actions/AppStoreActions';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
import { HelpMenu } from '$components/HelpMenu/HelpMenu';
import InstallPWABanner from '$components/InstallPWABanner';
import { LoadingScreen } from '$components/LoadingScreen';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import trpc from '$lib/api/trpc';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scheduleName, setScheduleName] = useState<string | null>(null);

    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const loadSharedSchedule = async () => {
            if (!scheduleId) {
                setError('Invalid schedule ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sharedSchedule: any = await trpc.userData.getSharedSchedule.query({
                    scheduleId,
                });

                // Load the shared schedule as a full schedule so it shows on the calendar
                // We'll keep skeleton mode enabled to prevent editing
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

                // Load as full schedule so calendar can display it (fetches course details from WebSOC)
                const loadSuccess = await AppStore.loadSchedule(scheduleSaveState);

                if (!loadSuccess) {
                    throw new Error('Failed to load shared schedule');
                }
                // Re-enable skeleton mode after loading to prevent editing
                AppStore.skeletonMode = true;
                AppStore.emit('skeletonModeChange');
                setScheduleName(sharedSchedule.scheduleName);
                setLoading(false);
            } catch (err) {
                console.error('Error loading shared schedule:', err);
                setError('Failed to load shared schedule. It may not exist or may have been deleted.');
                setLoading(false);
            }
        };

        loadSharedSchedule();

        // Cleanup: exit skeleton mode when leaving the page
        return () => {
            // Only cleanup if we're still in skeleton mode (user navigated away)
            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }
        };
    }, [scheduleId, sessionIsValid]); // Re-load if session status changes (user logs in/out)

    const handleAddToMySchedules = useCallback(async () => {
        if (!scheduleId || !sessionIsValid) {
            return;
        }

        try {
            await importSharedScheduleById(scheduleId);
            navigate('/');
        } catch (err) {
            console.error('Error adding schedule to account:', err);
        }
    }, [scheduleId, sessionIsValid, navigate]);

    if (loading) {
        return <LoadingScreen open={true} />;
    }

    if (error) {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack component="main" height="100dvh" justifyContent="center" alignItems="center" spacing={2}>
                    <Alert severity="error">{error}</Alert>
                    <Button variant="contained" onClick={() => navigate('/')}>
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
                            py: 1,
                            backgroundColor: 'background.paper',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" component="h1">
                                Viewing: {scheduleName}
                            </Typography>
                            {sessionIsValid && (
                                <Button variant="contained" onClick={handleAddToMySchedules}>
                                    Add to My Schedules
                                </Button>
                            )}
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
