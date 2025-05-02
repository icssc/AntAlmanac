import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { isEmptySchedule, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import { LoadingScreen } from '$components/LoadingScreen';
import trpc from '$lib/api/trpc';
import {
    getLocalStorageDataCache,
    setLocalStorageImportedUser,
    getLocalStorageUserId,
    removeLocalStorageUserId,
    removeLocalStorageImportedUser,
    removeLocalStorageDataCache,
    removeLocalStorageFromLoading,
    setLocalStorageSessionId,
} from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

export function AuthPage() {
    const { session, updateSession: setSession } = useSessionStore();
    const [searchParams] = useSearchParams();
    // const navigate = useNavigate();

    const handleSearchParamsChange = useCallback(async () => {
        try {
            const code = searchParams.get('code');
            if (!code) {
                window.location.href = '/';
                return;
            }

            const { sessionToken, userId, providerId } = await trpc.userData.handleGoogleCallback.mutate({
                code: code,
                token: session ?? '',
            });

            const savedUserId = getLocalStorageUserId() ?? '';
            removeLocalStorageUserId();

            if (sessionToken && providerId) {
                // await setSession(sessionToken);
                setLocalStorageSessionId(sessionToken);

                const dataCache = getLocalStorageDataCache();
                const savedData = getLocalStorageDataCache();

                if (savedUserId || dataCache) {
                    removeLocalStorageDataCache();
                    removeLocalStorageImportedUser();
                } else {
                    const userData = await trpc.userData.getUserData.query({ userId: userId });
                    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
                    if (savedUserId !== '') {
                        await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                        setLocalStorageImportedUser(savedUserId);
                    }
                    if (savedData) {
                        if (isEmptySchedule(userData.userData.schedules)) {
                            const data = JSON.parse(savedData);
                            scheduleSaveState.schedules = data;
                        } else {
                            const saveState = userData && 'userData' in userData ? userData.userData : userData;
                            mergeShortCourseSchedules(saveState.schedules, JSON.parse(savedData));
                            scheduleSaveState.schedules = saveState.schedules;
                            console.log(scheduleSaveState.schedules);
                        }
                        await trpc.userData.saveUserData.mutate({
                            id: providerId,
                            data: {
                                id: providerId,
                                userData: scheduleSaveState,
                            },
                        });
                    }
                }
                removeLocalStorageFromLoading();
                // navigate('/');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
    }, [searchParams, session, setSession]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
