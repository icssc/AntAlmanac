import { isEmptySchedule, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import { LoadingScreen } from '$components/LoadingScreen';
import trpc from '$lib/api/trpc';
import {
    getLocalStorageAuthReturnPath,
    getLocalStorageDataCache,
    getLocalStorageFromLoading,
    setLocalStorageImportedUser,
    getLocalStorageUserId,
    removeLocalStorageAuthReturnPath,
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

function getSafeReturnPath() {
    const candidate = getLocalStorageAuthReturnPath();
    removeLocalStorageAuthReturnPath();

    if (!candidate) {
        return '/';
    }

    if (candidate.startsWith('/') && !candidate.startsWith('//')) {
        return candidate;
    }

    try {
        const url = new URL(candidate, window.location.origin);
        if (url.origin === window.location.origin) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        // Ignore malformed candidate and fallback to root.
    }

    return '/';
}

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const isAuthenticatingRef = useRef(false);

    const handleSearchParamsChange = useCallback(async () => {
        // Prevent race condition: only allow one authentication attempt at a time
        if (isAuthenticatingRef.current) {
            return;
        }

        // Compute (and immediately clear) the return path at the top so that
        // every exit — success, error, or early-return — uses the same value
        // and never leaves a stale authReturnPath in localStorage.
        const returnPath = getSafeReturnPath();

        try {
            // Silent SSO returned an error — the auth server has no session.
            if (searchParams.get('error') === 'login_required') {
                clearSsoCookie();
                window.location.href = returnPath;
                return;
            }

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            if (!code || !state) {
                window.location.href = returnPath;
                return;
            }

            isAuthenticatingRef.current = true;

            const { userId, providerId, newUser } = await trpc.userData.handleGoogleCallback.mutate({
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
                window.location.href = returnPath;
                return;
            }

            setSsoCookie();

            // load schedule without saving any changes
            if (fromLoading !== '') {
                removeLocalStorageFromLoading();
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = returnPath;
                return;
            }

            // no changes to save
            if (savedUserId === '' && savedData === '') {
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = returnPath;
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

                // Fetch user info to enable proper account migration
                const userInfo = await trpc.userData.getUserByUid.query({ userId });

                await trpc.userData.saveUserData.mutate({
                    id: providerId,
                    data: {
                        id: providerId,
                        email: userInfo?.email ?? undefined,
                        name: userInfo?.name ?? undefined,
                        avatar: userInfo?.avatar ?? undefined,
                        userData: scheduleSaveState,
                    },
                });
            }
            window.location.href = returnPath;
        } catch (error) {
            console.error('Error during authentication', error);
            clearSsoCookie();
            window.location.href = returnPath;
        }
    }, [searchParams]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
