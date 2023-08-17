import { useState } from 'react';
import { appendSchedule, saveSchedule } from '$actions/AppStoreActions';
import LoadSaveButtonBase from '$components/AppBar/LoadSaveButtons/LoadSaveButtonBase';

const LoadSaveButtonsAuth = () => {
    const [loading, setLoading] = useState(false);

    const appendScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await appendSchedule(userID, rememberMe);
        setLoading(false);
    };

    const saveScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await saveSchedule(userID, rememberMe);
        setLoading(false);
    };

    return (
        <>
            <LoadSaveButtonBase
                actionName={'Save'}
                action={saveScheduleAndSetLoading}
                disabled={loading}
                loading={false}
            />
            <LoadSaveButtonBase
                actionName={'Load Legacy'}
                action={appendScheduleAndSetLoading}
                disabled={false}
                loading={loading}
                dialogText={
                    'Enter your username here to load your legacy schedule and append it to your current schedule.'
                }
            />
        </>
    );
};

export default LoadSaveButtonsAuth;
