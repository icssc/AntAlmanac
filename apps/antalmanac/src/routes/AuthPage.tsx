import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { isEmptySchedule, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import { LoadingScreen } from '$components/LoadingScreen';
import trpc from '$lib/api/trpc';
import {
    getLocalStorageDataCache,
    getLocalStorageFromLoading,
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
    const { session } = useSessionStore();
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

            const fromLoading = getLocalStorageFromLoading() ?? '';
            const savedUserId = getLocalStorageUserId() ?? '';
            const savedData = getLocalStorageDataCache() ?? '';
            removeLocalStorageUserId();

            if (sessionToken && providerId) {
                setLocalStorageSessionId(sessionToken);

                if (fromLoading !== '') {
                    removeLocalStorageFromLoading();
                    removeLocalStorageDataCache();
                    removeLocalStorageImportedUser();
                } else {
                    if (savedUserId === '' && savedData === '') {
                        removeLocalStorageDataCache();
                        removeLocalStorageImportedUser();
                    } else {
                        const userData = await trpc.userData.getUserData.query({ userId: userId });
                        const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

                        if (savedData !== '') {
                            if (savedUserId !== '') {
                                await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                                setLocalStorageImportedUser(savedUserId);
                            }

                            const data = JSON.parse(savedData);

                            if (isEmptySchedule(userData.userData.schedules)) {
                                scheduleSaveState.schedules = data;
                            } else {
                                const saveState = userData && 'userData' in userData ? userData.userData : userData;
                                mergeShortCourseSchedules(saveState.schedules, data, '(import)-');
                                scheduleSaveState.schedules = saveState.schedules;
                                scheduleSaveState.scheduleIndex = saveState.schedules.length - 1;
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
                }
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
    }, [searchParams, session]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
