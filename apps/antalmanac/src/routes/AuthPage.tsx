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
    setLocalStorageOnFirstSignin,
} from '$lib/localStorage';
import AppStore from '$stores/AppStore';

export function AuthPage() {
    const [searchParams] = useSearchParams();

    const handleSearchParamsChange = useCallback(async () => {
        try {
            const code = searchParams.get('code');
            if (!code) {
                window.location.href = '/';
                return;
            }

            // Retrieve PKCE parameters from sessionStorage
            const code_verifier = sessionStorage.getItem('oidc_code_verifier') || '';
            const state = sessionStorage.getItem('oidc_state') || '';

            // Clean up sessionStorage
            sessionStorage.removeItem('oidc_code_verifier');
            sessionStorage.removeItem('oidc_state');

            if (!code_verifier || !state) {
                console.error('Missing PKCE parameters');
                window.location.href = '/';
                return;
            }

            const { sessionToken, userId, providerId, newUser } = await trpc.userData.handleOidcCallback.mutate({
                code: code,
                token: '',
                code_verifier,
                state,
            });

            const fromLoading = getLocalStorageFromLoading() ?? '';
            const savedUserId = getLocalStorageUserId() ?? '';
            const savedData = getLocalStorageDataCache() ?? '';

            if (newUser) {
                setLocalStorageOnFirstSignin('true');
            } else {
                removeLocalStorageUserId();
            }

            if (!(sessionToken && providerId)) {
                window.location.href = '/';
                return;
            }

            setLocalStorageSessionId(sessionToken);

            // load schedule without saving any changes
            if (fromLoading !== '') {
                removeLocalStorageFromLoading();
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = '/';
                return;
            }

            // no changes to save
            if (savedUserId === '' && savedData === '') {
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = '/';
                return;
            }

            // handle unsaved changes
            if (savedData !== '') {
                const userData = await trpc.userData.getUserData.query({ userId: userId });
                const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

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
            window.location.href = '/';
        } catch (error) {
            console.error('Error during authentication', error);
        }
    }, [searchParams]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
