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
    setLocalStorageOnFirstSignin,
} from '$lib/localStorage';
import { clearSsoCookie, setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const isAuthenticatingRef = useRef(false);

    const handleSearchParamsChange = useCallback(async () => {
        // Prevent race condition: only allow one authentication attempt at a time
        if (isAuthenticatingRef.current) {
            return;
        }

        try {
            // Silent SSO returned an error — the auth server has no session.
            if (searchParams.get('error') === 'login_required') {
                clearSsoCookie();
                window.location.href = '/';
                return;
            }

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            if (!code || !state) {
                window.location.href = '/';
                return;
            }

            isAuthenticatingRef.current = true;

            const { providerId, newUser } = await trpc.userData.handleGoogleCallback.mutate({
                code: code,
                state: state,
            });

            const fromLoading = getLocalStorageFromLoading() ?? '';
            const savedUserId = getLocalStorageUserId() ?? '';
            const savedData = getLocalStorageDataCache() ?? '';

            if (newUser) {
                setLocalStorageOnFirstSignin('true');
            } else {
                removeLocalStorageUserId();
            }

            if (!providerId) {
                window.location.href = '/';
                return;
            }

            setSsoCookie();

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
                const userData = await trpc.userData.getUserDataWithSession.query();
                const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

                if (savedUserId !== '') {
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

                await trpc.userData.saveUserData.mutate({
                    userData: scheduleSaveState,
                });
            }
            window.location.href = '/';
        } catch (error) {
            console.error('Error during authentication', error);
            clearSsoCookie();
            window.location.href = '/';
        }
    }, [searchParams]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
