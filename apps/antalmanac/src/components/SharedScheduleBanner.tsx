import { Add, Close } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Stack, Typography } from '@mui/material';
import type { ScheduleSaveState } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useMatch, useNavigate, useParams } from 'react-router-dom';

import { changeCurrentSchedule, importSharedScheduleById, openSnackbar } from '$actions/AppStoreActions';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { removeLocalStorageUnsavedActions } from '$lib/localStorage';
import { SHARED_SCHEDULE_PREFIX } from '$src/globals';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { createEmptyShortCourseSchedule } from '$stores/scheduleHelpers';

interface Props {
    error: string | null;
    setError: (error: string | null) => void;
}

const SharedScheduleBanner = ({ error, setError }: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const friendMatch = useMatch('/share/friend/:userId');
    const params = useParams<{ scheduleId?: string; userId?: string }>();

    const friendUserId = friendMatch?.params?.userId;
    const scheduleId = !friendMatch ? params.scheduleId : undefined;
    const friendNameFromState = (location.state as { friendName?: string } | null)?.friendName;
    const [fetchedFriendName, setFetchedFriendName] = useState<string | null>(null);
    const friendName = friendNameFromState ?? fetchedFriendName ?? 'Friend';

    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);
    const session = useSessionStore((state) => state.session);
    const updateSession = useSessionStore((state) => state.updateSession);
    const setOpenLoadingSchedule = scheduleComponentsToggleStore((state) => state.setOpenLoadingSchedule);
    const postHog = usePostHog();

    const [scheduleName, setScheduleName] = useState<string | null>(null);
    const [isAddingSchedule, setIsAddingSchedule] = useState(false);

    const hasAttemptedLoadRef = useRef(false);
    const currentLoadKeyRef = useRef<string>(`${friendUserId ?? ''}-${scheduleId ?? ''}`);

    const isMobileScreen = useIsMobile();

    const beginLoadingSchedule = useCallback(() => {
        setOpenLoadingSchedule(true);

        if (AppStore.getSkeletonMode()) {
            AppStore.exitSkeletonMode();
        }
    }, [setOpenLoadingSchedule]);

    const loadFriendSchedules = useCallback(
        async (userId: string) => {
            try {
                beginLoadingSchedule();
                removeLocalStorageUnsavedActions();

                const userData = await trpc.userData.getUserData.query({ userId });

                if (!userData?.userData?.schedules?.length) {
                    setError("This friend doesn't have any schedules to view.");
                    return;
                }

                const schedules = userData.userData.schedules;
                const scheduleIndex = 0;
                const loadSuccess = await AppStore.loadSchedule({ schedules, scheduleIndex });

                if (!loadSuccess) {
                    throw new Error('Failed to load friend schedules');
                }
                changeCurrentSchedule(scheduleIndex);
                setScheduleName(null);
                setError(null);
            } catch (err) {
                console.error('Error loading friend schedules:', err);
                setError("Couldn't load this friend's schedules.");
            } finally {
                setOpenLoadingSchedule(false);
            }
        },
        [beginLoadingSchedule, setError, setOpenLoadingSchedule]
    );

    useEffect(() => {
        const loadKey = `${friendUserId ?? ''}-${scheduleId ?? ''}`;
        if (currentLoadKeyRef.current !== loadKey) {
            hasAttemptedLoadRef.current = false;
            currentLoadKeyRef.current = loadKey;
            setFetchedFriendName(null);
        }

        if (hasAttemptedLoadRef.current) {
            return;
        }

        const loadContent = async () => {
            // Validate stored session so direct visits (e.g. pasted URL) recognize the user as logged in
            const currentSession = useSessionStore.getState().session;
            if (currentSession) {
                await updateSession(currentSession);
            }

            if (friendUserId) {
                hasAttemptedLoadRef.current = true;
                try {
                    beginLoadingSchedule();
                    const sessionAfterValidation = useSessionStore.getState().session;
                    if (!sessionAfterValidation) {
                        setError("You're not allowed to see this schedule.");
                        setOpenLoadingSchedule(false);
                        return;
                    }
                    const { users: currentUser } = await trpc.userData.getUserAndAccountBySessionToken.query({
                        token: sessionAfterValidation,
                    });
                    const allowed = await trpc.friends.areFriends.query({
                        viewerId: currentUser.id,
                        targetUserId: friendUserId,
                    });
                    if (!allowed) {
                        setError("You're not allowed to see this schedule.");
                        setOpenLoadingSchedule(false);
                        return;
                    }
                    if (!friendNameFromState) {
                        const friendUser = await trpc.userData.getUserByUid.query({ userId: friendUserId });
                        setFetchedFriendName(friendUser?.name ?? friendUser?.email ?? 'Friend');
                    }
                } catch {
                    setError("You're not allowed to see this schedule.");
                    setOpenLoadingSchedule(false);
                    return;
                }
                await loadFriendSchedules(friendUserId);
                return;
            }

            if (!scheduleId) {
                setError('Invalid schedule ID');
                setOpenLoadingSchedule(false);
                hasAttemptedLoadRef.current = true;
                return;
            }

            hasAttemptedLoadRef.current = true;

            try {
                beginLoadingSchedule();
                removeLocalStorageUnsavedActions();

                const sharedSchedule = await trpc.userData.getSharedSchedule.query({
                    scheduleId,
                });

                const scheduleSaveState: ScheduleSaveState = {
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

                logAnalytics(postHog, {
                    category: analyticsEnum.sharedSchedule,
                    action: analyticsEnum.sharedSchedule.actions.OPEN,
                    label: sharedSchedule.scheduleName,
                    value: sharedSchedule.courses.length,
                });

                setScheduleName(sharedSchedule.scheduleName);
                setError(null);
            } catch (err) {
                console.error('Error loading shared schedule:', err);
                setError('Failed to load shared schedule. It may not exist or may have been deleted.');
            }
            setOpenLoadingSchedule(false);
        };

        loadContent();

        return () => {
            setOpenLoadingSchedule(false);
        };
    }, [
        friendUserId,
        scheduleId,
        friendNameFromState,
        session,
        setOpenLoadingSchedule,
        setError,
        beginLoadingSchedule,
        loadFriendSchedules,
        postHog,
        updateSession,
    ]);

    const handleLoadSchedule = useCallback(async (sessionToken: string | null) => {
        if (sessionToken) {
            const userDataResponse = await trpc.userData.getUserDataWithSession.query({
                refreshToken: sessionToken,
            });

            if (userDataResponse) {
                const scheduleSaveState: ScheduleSaveState = userDataResponse.userData;

                if (scheduleSaveState) {
                    await AppStore.loadSchedule(scheduleSaveState);
                }
            }
        } else {
            const emptyScheduleData = createEmptyShortCourseSchedule();
            const emptySchedule: ScheduleSaveState = {
                schedules: [emptyScheduleData],
                scheduleIndex: 0,
            };
            await AppStore.loadSchedule(emptySchedule);
        }
    }, []);

    const loadSessionSchedule = useCallback(async () => {
        const sessionToken = useSessionStore.getState().session;
        if (!sessionToken) {
            throw new Error('No session token available');
        }

        await handleLoadSchedule(sessionToken);
    }, [handleLoadSchedule]);

    const handleExitSharedSchedule = useCallback(async () => {
        try {
            beginLoadingSchedule();

            const sessionToken = useSessionStore.getState().session;
            await handleLoadSchedule(sessionIsValid ? sessionToken : null);
        } catch (err) {
            console.error('Error exiting shared schedule:', err);
        }

        setOpenLoadingSchedule(false);
        navigate('/');
    }, [navigate, setOpenLoadingSchedule, beginLoadingSchedule, handleLoadSchedule, sessionIsValid]);

    const handleAddToMySchedules = useCallback(async () => {
        const idToImport = friendUserId ? AppStore.getScheduleId(AppStore.getCurrentScheduleIndex()) : scheduleId;
        if (!idToImport) {
            return;
        }

        setIsAddingSchedule(true);

        try {
            beginLoadingSchedule();

            const sharedSchedule = await trpc.userData.getSharedSchedule.query({ scheduleId: idToImport });

            if (sessionIsValid) {
                const sessionToken = useSessionStore.getState().session;
                if (sessionToken) {
                    const userDataResponse = await trpc.userData.getUserDataWithSession.query({
                        refreshToken: sessionToken,
                    });

                    if (userDataResponse?.userData) {
                        await AppStore.loadSchedule(userDataResponse.userData);
                    }
                }

                await importSharedScheduleById(idToImport);
            } else {
                const currentSchedules = AppStore.schedule.getScheduleAsSaveState();
                const currentSchedule = currentSchedules.schedules[currentSchedules.scheduleIndex];

                if (currentSchedule && currentSchedule.scheduleName === sharedSchedule.scheduleName) {
                    const prefixedName = `${SHARED_SCHEDULE_PREFIX}${sharedSchedule.scheduleName}`;
                    AppStore.renameSchedule(currentSchedules.scheduleIndex, prefixedName);
                    openSnackbar(
                        'success',
                        `Shared schedule "${sharedSchedule.scheduleName}" added to your schedules!`
                    );
                } else {
                    await importSharedScheduleById(idToImport);
                }
            }

            logAnalytics(postHog, {
                category: analyticsEnum.sharedSchedule,
                action: analyticsEnum.sharedSchedule.actions.IMPORT_SCHEDULE,
                label: sharedSchedule.scheduleName,
                value: sessionIsValid ? 1 : 0,
            });
        } catch (err) {
            console.error('Error adding schedule to account:', err);
            if (AppStore.getSkeletonMode()) {
                AppStore.exitSkeletonMode();
            }
        }

        setOpenLoadingSchedule(false);
        navigate('/');
    }, [friendUserId, scheduleId, sessionIsValid, navigate, setOpenLoadingSchedule, beginLoadingSchedule, postHog]);

    const handleGoHome = useCallback(async () => {
        try {
            beginLoadingSchedule();

            await loadSessionSchedule();
        } catch (err) {
            console.error('Error loading user data:', err);
        }

        setOpenLoadingSchedule(false);
        navigate('/');
    }, [navigate, setOpenLoadingSchedule, beginLoadingSchedule, loadSessionSchedule]);

    if (error) {
        return (
            <>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={handleGoHome}>
                    Go Home
                </Button>
            </>
        );
    }

    return (
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
                    {friendUserId ? (
                        <>
                            Viewing{' '}
                            <strong style={{ whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>{friendName}</strong>
                            &apos;s schedules
                        </>
                    ) : (
                        <>
                            Viewing Shared Schedule:{' '}
                            <strong style={{ whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>{scheduleName}</strong>
                        </>
                    )}
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
                        <Button
                            variant="contained"
                            onClick={handleAddToMySchedules}
                            size="large"
                            loading={isAddingSchedule}
                        >
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
    );
};

export default SharedScheduleBanner;
