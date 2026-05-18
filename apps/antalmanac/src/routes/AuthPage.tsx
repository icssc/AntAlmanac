import { isEmptySchedule, mergeShortCourseSchedules } from '$actions/AppStoreActions';
import { LoadingScreen } from '$components/LoadingScreen';
import { analyticsIdentifyUser } from '$lib/analytics/analytics';
import { trpc, trpcReact } from '$lib/api/trpc';
import {
    clearAuthSessionHandoff,
    getPendingScheduleMerge,
    removePendingScheduleMerge,
    setImportedGuestUsername,
    setLegacyGuestUserIdForImport,
    setPendingFirstSigninImport,
} from '$lib/authSessionStorage';
import { getLocalStorageUserId, removeLocalStorageUserId } from '$lib/localStorage';
import { clearSsoCookie, setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const isAuthenticatingRef = useRef(false);
    const postHog = usePostHog();
    const { mutateAsync: handleGoogleCallback } = trpcReact.auth.handleGoogleCallback.useMutation();
    const { mutateAsync: flagImported } = trpcReact.schedule.flagImported.useMutation();
    const { mutateAsync: saveSchedule } = trpcReact.schedule.save.useMutation();

    const handleSearchParamsChange = useCallback(async () => {
        // Prevent race condition: only allow one authentication attempt at a time
        if (isAuthenticatingRef.current) {
            return;
        }

        try {
            const returnUrl = await trpc.auth.getAuthReturnUrl.query();

            // Silent SSO returned an error — the auth server has no session.
            if (searchParams.get('error') === 'login_required') {
                clearSsoCookie();
                window.location.href = returnUrl;
                return;
            }

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            if (!code || !state) {
                window.location.href = returnUrl;
                return;
            }

            isAuthenticatingRef.current = true;

            const { userId, providerId, newUser } = await handleGoogleCallback({
                code: code,
                state: state,
            });

            analyticsIdentifyUser(postHog, userId);

            const legacyGuestUserId = getLocalStorageUserId() ?? '';
            const pendingScheduleMerge = getPendingScheduleMerge() ?? '';

            if (newUser) {
                setPendingFirstSigninImport();
                if (legacyGuestUserId !== '') {
                    setLegacyGuestUserIdForImport(legacyGuestUserId);
                }
            } else {
                removeLocalStorageUserId();
            }

            if (!providerId) {
                window.location.href = returnUrl;
                return;
            }

            setSsoCookie();

            if (pendingScheduleMerge === '') {
                clearAuthSessionHandoff();
                window.location.href = returnUrl;
                return;
            }

            const userData = await trpc.schedule.get.query();
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (legacyGuestUserId !== '') {
                await flagImported({ username: legacyGuestUserId });
                setImportedGuestUsername(legacyGuestUserId);
            }

            const data = JSON.parse(pendingScheduleMerge);

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

            await saveSchedule({
                userData: scheduleSaveState,
            });
            removePendingScheduleMerge();
            window.location.href = returnUrl;
        } catch (error) {
            console.error('Error during authentication', error);
            clearSsoCookie();
            clearAuthSessionHandoff();
            window.location.href = '/';
        }
    }, [searchParams, postHog, handleGoogleCallback, flagImported, saveSchedule]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
