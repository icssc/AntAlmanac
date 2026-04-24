import { isEmptySchedule, loadScheduleWithSessionToken, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import SignInAlertDialog from '$components/SignInAlertDialog';
import trpc from '$lib/api/trpc';
import { authClient, signOut } from '$lib/auth/authClient';
import {
    getLocalStorageDataCache,
    getLocalStorageUserId,
    removeLocalStorageDataCache,
    removeLocalStorageImportedUser,
    removeLocalStorageUserId,
    setLocalStorageImportedUser,
} from '$lib/localStorage';
import { setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const AuthInitializer = () => {
    const [openAlert, setOpenalert] = useState(false);

    const isInitializingRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const setOpenLoadingSchedule = useScheduleComponentsToggleStore((state) => state.setOpenLoadingSchedule);
    const { updateSession, setAreSchedulesLoaded, googleId } = useSessionStore(
        useShallow((state) => ({
            updateSession: state.updateSession,
            setAreSchedulesLoaded: state.setAreSchedulesLoaded,
            googleId: state.googleId,
        }))
    );

    const loadNotifications = useNotificationStore((state) => state.loadNotifications);

    const { data: sessionData, isPending } = authClient.useSession();

    const handleUnsavedChanges = useCallback(async () => {
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

        if (savedData && googleId) {
            const userData = await trpc.userData.getUserData.query({ userId: sessionData.user.id });
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (savedUserId) {
                await trpc.userData.flagImportedSchedule.mutate({ providerAccountId: savedUserId });
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

            await trpc.userData.saveUserData.mutate({
                id: googleId,
                data: {
                    id: googleId,
                    userData: scheduleSaveState,
                },
            });

            removeLocalStorageDataCache();

            openSnackbar('success', `Unsaved changes have been saved to your account!`);
        }
    }, [sessionData, googleId]);

    const loadScheduleAndSetLoadingAuth = useCallback(async () => {
        if (!sessionData) {
            return;
        }

        await loadScheduleWithSessionToken();
    }, [sessionData, setOpenLoadingSchedule]);

    useEffect(() => {
        if (isInitializingRef.current || hasInitializedRef.current) {
            return;
        }

        if (sessionData) {
            isInitializingRef.current = true;
            (async () => {
                if (sessionData.session.expiresAt < new Date()) {
                    console.log('Session expired, logging out');
                    signOut();
                    isInitializingRef.current = false;
                    return;
                }
                try {
                    setOpenLoadingSchedule(true);
                    const isSessionValid = await updateSession(sessionData);
                    if (!isSessionValid) {
                        setOpenalert(true);
                        return;
                    }
                    setSsoCookie();
                    await handleUnsavedChanges();

                    await loadScheduleAndSetLoadingAuth();

                    setAreSchedulesLoaded(true);

                    loadNotifications();

                    hasInitializedRef.current = true;
                } catch (error) {
                    console.error('Error during authentication:', error);
                    signOut();
                }

                isInitializingRef.current = false;
                setOpenLoadingSchedule(false);
            })();
        } else if (!isPending) {
            loadNotifications();
        }
    }, [
        sessionData,
        updateSession,
        handleUnsavedChanges,
        loadScheduleAndSetLoadingAuth,
        setAreSchedulesLoaded,
        isPending,
    ]);

    return (
        <SignInAlertDialog
            open={openAlert}
            title="Your session has expired. Please sign in again."
            onClose={() => setOpenalert(false)}
        />
    );
};

export default AuthInitializer;
