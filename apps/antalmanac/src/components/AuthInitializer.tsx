import { isEmptySchedule, loadScheduleWithSessionToken, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import SignInAlertDialog from '$components/SignInAlertDialog';
import trpc from '$lib/api/trpc';
import { authClient, getGoogleAccount, signOut } from '$lib/auth/authClient';
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
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const AuthInitializer = () => {
    const [openAlert, setOpenalert] = useState(false);

    const setOpenLoadingSchedule = useScheduleComponentsToggleStore((state) => state.setOpenLoadingSchedule);
    const { updateSession, setAreSchedulesLoaded } = useSessionStore(
        useShallow((state) => ({
            updateSession: state.updateSession,
            setAreSchedulesLoaded: state.setAreSchedulesLoaded,
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

        const googleAccount = await getGoogleAccount();

        if (savedData && googleAccount) {
            const userData = await trpc.userData.getUserData.query({ userId: sessionData.user.id });
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (savedUserId) {
                await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                setLocalStorageImportedUser(savedUserId);
            }

            const data = JSON.parse(savedData);

            if (userData?.userData && isEmptySchedule(userData.userData.schedules)) {
                scheduleSaveState.schedules = data;
            } else {
                const saveState = userData && 'userData' in userData ? userData.userData : userData;
                if (saveState !== null) {
                    mergeShortCourseSchedules(saveState.schedules, data, '(import)-');
                    scheduleSaveState.schedules = saveState.schedules;
                    scheduleSaveState.scheduleIndex = saveState.schedules.length - 1;
                }
            }

            await trpc.userData.saveUserData.mutate({
                id: googleAccount.userId,
                data: {
                    id: googleAccount.userId,
                    userData: scheduleSaveState,
                },
            });

            removeLocalStorageDataCache();

            openSnackbar('success', `Unsaved changes have been saved to your account!`);
        }
    }, [sessionData]);

    const loadScheduleAndSetLoadingAuth = useCallback(async () => {
        if (!sessionData) {
            return;
        }

        setOpenLoadingSchedule(true);

        await loadScheduleWithSessionToken();

        setOpenLoadingSchedule(false);
    }, [sessionData, setOpenLoadingSchedule]);

    useEffect(() => {
        if (sessionData) {
            (async () => {
                if (sessionData.session.expiresAt < new Date()) {
                    console.log('Session expired, logging out');
                    signOut();
                    return;
                }
                try {
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
                } catch (error) {
                    console.error('Error during authentication:', error);
                    signOut();
                }
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
