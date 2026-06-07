import { isEmptySchedule, loadSchedule, mergeShortCourseSchedules, UserData } from '$actions/AppStoreActions';
import { SignInAlertDialog } from '$components/SignInAlertDialog';
import { analyticsIdentifyUser } from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { authClient, signOut } from '$lib/auth/authClient';
import {
    getLocalStorageDataCache,
    getLocalStorageUserId,
    getWasLoggedIn,
    removeLocalStorageDataCache,
    removeLocalStorageImportedUser,
    removeLocalStorageUserId,
    setLocalStorageImportedUser,
    setWasLoggedIn,
} from '$lib/localStorage';
import { setSsoCookie } from '$lib/ssoCookie';
import { useAppInitStore } from '$stores/AppInitStore';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { usePlannerStore } from '$stores/PlannerStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const AuthInitializer = () => {
    const [openAlert, setOpenAlert] = useState(false);

    const isInitializingRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const setOpenLoadingSchedule = useScheduleComponentsToggleStore((state) => state.setOpenLoadingSchedule);
    const { setAreSchedulesLoaded, setHasCheckedAuth } = useAppInitStore(
        useShallow((state) => ({
            setAreSchedulesLoaded: state.setAreSchedulesLoaded,
            setHasCheckedAuth: state.setHasCheckedAuth,
        }))
    );

    const loadPlannerRoadmaps = usePlannerStore((state) => state.loadPlannerRoadmaps);

    const loadNotifications = useNotificationStore((state) => state.loadNotifications);

    const { data: sessionData, isPending: isSessionPending } = authClient.useSession();

    const postHog = usePostHog();

    const handleAuthChecked = () => {
        hasInitializedRef.current = true;
        setHasCheckedAuth(true);
    };

    const handleInitialized = () => {
        setOpenLoadingSchedule(false);
        loadNotifications();
        if (useAppInitStore.getState().areSchedulesLoaded) {
            void loadPlannerRoadmaps();
        }
    };

    const loadUnsavedChanges = useEffectEvent(async (userData: UserData) => {
        if (!sessionData) {
            return;
        }

        const savedUserId = getLocalStorageUserId();
        const savedData = getLocalStorageDataCache();

        removeLocalStorageUserId();

        // no changes to save
        if (savedUserId === null && savedData === null) {
            removeLocalStorageDataCache();
            removeLocalStorageImportedUser();
            return;
        }

        if (savedData) {
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (savedUserId) {
                await trpc.schedule.flagImported.mutate({ username: savedUserId });
                setLocalStorageImportedUser(savedUserId);
            }

            const data = JSON.parse(savedData);

            const saveState = userData?.userData;
            if (saveState) {
                if (isEmptySchedule(saveState.schedules)) {
                    scheduleSaveState.schedules = data;
                } else {
                    mergeShortCourseSchedules(saveState.schedules, data, '(import)-');
                    scheduleSaveState.schedules = saveState.schedules;
                    scheduleSaveState.scheduleIndex = saveState.schedules.length - 1;
                }
            }

            await trpc.schedule.save.mutate({
                userData: scheduleSaveState,
            });

            removeLocalStorageDataCache();

            openSnackbar('success', `Unsaved changes have been saved to your account!`);
        }
    });

    useEffect(() => {
        if (isInitializingRef.current || hasInitializedRef.current || isSessionPending) {
            return;
        }

        // Clean up stale localStorage token from before the cookie migration
        window.localStorage.removeItem('sessionId');

        if (sessionData) {
            (async () => {
                if (sessionData.session.expiresAt < new Date()) {
                    setOpenAlert(true);
                    handleAuthChecked();
                    handleInitialized();
                    return;
                }
                isInitializingRef.current = true;
                try {
                    setSsoCookie();

                    analyticsIdentifyUser(postHog, sessionData.user.id);

                    const userData = await trpc.schedule.get.query();
                    await loadSchedule({ prefetched: userData, postHog });
                    await loadUnsavedChanges(userData);

                    setAreSchedulesLoaded(true);
                    setWasLoggedIn(true);

                    handleAuthChecked();
                } catch (error) {
                    console.error('Error during authentication:', error);
                    signOut({ postHog });
                }

                isInitializingRef.current = false;

                handleInitialized();
            })();
        } else {
            if (getWasLoggedIn()) {
                setOpenAlert(true);
            }
            handleAuthChecked();
            handleInitialized();
        }
    }, [sessionData, isSessionPending, setAreSchedulesLoaded, postHog, setHasCheckedAuth, loadPlannerRoadmaps]);

    return (
        <SignInAlertDialog
            open={openAlert}
            title="Your session has expired. Please sign in again."
            onClose={() => setOpenAlert(false)}
        />
    );
};
