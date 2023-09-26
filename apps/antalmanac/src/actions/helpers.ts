import { TRPCError } from '@trpc/server';
import { ScheduleSaveState } from '@packages/antalmanac-types';
import trpc from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$actions/AppStoreActions';

const handleSaveError = (error: Error, userID: string): void => {
    if (error instanceof TRPCError) {
        openSnackbar('error', `Schedule could not be saved under username "${userID}`);
    } else {
        openSnackbar('error', 'Network error or server is down.');
    }
};

export const saveCodeUserSchedule = async (userID: string, scheduleSaveState: ScheduleSaveState): Promise<void> => {
    try {
        await trpc.users.saveUserData.mutate({ id: userID, userData: scheduleSaveState });

        openSnackbar(
            'success',
            `Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`
        );
        AppStore.saveSchedule();
    } catch (error) {
        handleSaveError(error, userID);
    }
};

export const saveAuthenticatedUserSchedule = async (
    userID: string,
    scheduleSaveState: ScheduleSaveState
): Promise<void> => {
    try {
        await trpc.authusers.updateUserData.mutate(scheduleSaveState);

        openSnackbar('success', `Schedule saved under your account. Don't forget to sign up for classes on WebReg!`);
        AppStore.saveSchedule();
    } catch (error) {
        handleSaveError(error, userID);
    }
};
