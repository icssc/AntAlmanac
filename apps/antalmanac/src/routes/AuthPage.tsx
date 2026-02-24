import { isEmptySchedule, mergeShortCourseSchedules } from "$actions/AppStoreActions";
import { LoadingScreen } from "$components/LoadingScreen";
import trpc from "$lib/api/trpc";
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
    setLocalStorageSessionId,
} from "$lib/localStorage";
import AppStore from "$stores/AppStore";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const isAuthenticatingRef = useRef(false);

    const handleSearchParamsChange = useCallback(async () => {
        // Prevent race condition: only allow one authentication attempt at a time
        if (isAuthenticatingRef.current) {
            return;
        }

        try {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            if (!code || !state) {
                window.location.href = "/";
                return;
            }

            isAuthenticatingRef.current = true;

            const { sessionToken, userId, providerId, newUser } =
                await trpc.userData.handleGoogleCallback.mutate({
                    code: code,
                    state: state,
                });

            const fromLoading = getLocalStorageFromLoading() ?? "";
            const savedUserId = getLocalStorageUserId() ?? "";
            const savedData = getLocalStorageDataCache() ?? "";

            if (newUser) {
                setLocalStorageOnFirstSignin("true");
            } else {
                removeLocalStorageUserId();
            }

            if (!(sessionToken && providerId)) {
                window.location.href = "/";
                return;
            }

            setLocalStorageSessionId(sessionToken);

            // load schedule without saving any changes
            if (fromLoading !== "") {
                removeLocalStorageFromLoading();
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = "/";
                return;
            }

            // no changes to save
            if (savedUserId === "" && savedData === "") {
                removeLocalStorageDataCache();
                removeLocalStorageImportedUser();
                window.location.href = "/";
                return;
            }

            // handle unsaved changes
            if (savedData !== "") {
                const userData = await trpc.userData.getUserData.query({ userId: userId });
                const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

                if (savedUserId !== "") {
                    await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                    setLocalStorageImportedUser(savedUserId);
                }

                const data = JSON.parse(savedData);

                if (userData !== null && isEmptySchedule(userData.userData.schedules)) {
                    scheduleSaveState.schedules = data;
                } else {
                    const saveState =
                        userData && "userData" in userData ? userData.userData : userData;
                    if (saveState !== null) {
                        mergeShortCourseSchedules(saveState.schedules, data, "(import)-");
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
            window.location.href = "/";
        } catch (error) {
            console.error("Error during authentication", error);
            isAuthenticatingRef.current = false;
        }
    }, [searchParams]);

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return <LoadingScreen open={true} />;
}
