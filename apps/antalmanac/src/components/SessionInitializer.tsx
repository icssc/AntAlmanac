import { useEffect } from 'react';

import { isEmptySchedule, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { authClient } from '$lib/auth/authClient';
import {
    getLocalStorageDataCache,
    getLocalStorageFromLoading,
    getLocalStorageUserId,
    removeLocalStorageDataCache,
    removeLocalStorageFromLoading,
    removeLocalStorageImportedUser,
    removeLocalStorageUserId,
    setLocalStorageImportedUser,
    setLocalStorageOnFirstSignin,
} from '$lib/localStorage';
import { clearSsoCookie, setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

const SessionInitializer = () => {
    const updateSession = useSessionStore((state) => state.updateSession);
    const { data: sessionData } = authClient.useSession();

    useEffect(() => {
        if (sessionData) {
            (async () => {
                if (sessionData.session.expiresAt < new Date()) {
                    console.log('Session expired, logging out');
                    await authClient.signOut();
                    return;
                }
                await updateSession(sessionData);
                try {
                    // FIXME
                    const isNewUser = false;

                    const fromLoading = getLocalStorageFromLoading();
                    const savedUserId = getLocalStorageUserId();
                    const savedData = getLocalStorageDataCache();

                    if (isNewUser) {
                        setLocalStorageOnFirstSignin('true');
                    } else {
                        removeLocalStorageUserId();
                    }

                    setSsoCookie();

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

                    // handle unsaved changes
                    if (savedData) {
                        const userData = await trpc.userData.getUserData.query({ userId: sessionData.user.id });
                        const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

                        if (savedUserId) {
                            await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                            setLocalStorageImportedUser(savedUserId);
                        }

                        const data = JSON.parse(savedData);

                        if (userData !== null && isEmptySchedule(userData.userData.schedules)) {
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
                } catch (error) {
                    console.error('Error during authentication', error);
                    clearSsoCookie();
                }
            })();
        }
    }, [sessionData, updateSession]);

    return null;
};

export default SessionInitializer;
