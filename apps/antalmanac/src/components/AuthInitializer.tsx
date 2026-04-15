import { useCallback, useEffect, useState } from 'react';

import { isEmptySchedule, loadScheduleWithSessionToken, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import SignInAlertDialog from '$components/SignInAlertDialog';
import trpc from '$lib/api/trpc';
import { authClient, signOut } from '$lib/auth/authClient';
import {
    getLocalStorageDataCache,
    getLocalStorageFromLoading,
    getLocalStorageUserId,
    removeLocalStorageDataCache,
    removeLocalStorageFromLoading,
    removeLocalStorageImportedUser,
    removeLocalStorageUserId,
    setLocalStorageImportedUser,
} from '$lib/localStorage';
import { setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';

const AuthInitializer = () => {
    const [openAlert, setOpenalert] = useState(false);

    const { setOpenLoadingSchedule } = scheduleComponentsToggleStore();
    const { updateSession, setAreSchedulesLoaded } = useSessionStore();

    const { data: sessionData } = authClient.useSession();

    const handleUnsavedChanges = useCallback(async () => {
        if (!sessionData) {
            return;
        }

        const fromLoading = getLocalStorageFromLoading();
        const savedUserId = getLocalStorageUserId();
        const savedData = getLocalStorageDataCache();

        removeLocalStorageUserId();

        // load schedule without saving any changes
        if (fromLoading) {
            removeLocalStorageFromLoading();
            removeLocalStorageDataCache();
            removeLocalStorageImportedUser();
            return;
        }

        // no changes to save
        if (savedUserId === null && savedData === null) {
            removeLocalStorageDataCache();
            removeLocalStorageImportedUser();
            return;
        }

        if (savedData) {
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

                    useNotificationStore.getState().loadNotifications();
                } catch (error) {
                    console.error('Error during authentication:', error);
                    signOut();
                }
            })();
        }
    }, [sessionData, updateSession, handleUnsavedChanges, loadScheduleAndSetLoadingAuth, setAreSchedulesLoaded]);

    return (
        <SignInAlertDialog
            open={openAlert}
            title="Your session has expired. Please sign in again."
            onClose={() => setOpenalert(false)}
        />
    );
};

export default AuthInitializer;
