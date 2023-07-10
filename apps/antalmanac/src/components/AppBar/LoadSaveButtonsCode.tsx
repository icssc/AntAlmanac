import { useEffect, useState } from 'react';
import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import LoadSaveButtonBase from "$components/AppBar/LoadSaveButtonBase";

const LoadSaveButtonsCode = () => {
    const [loading, setLoading] = useState(false);

    const loadScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await loadSchedule(userID, rememberMe);
        setLoading(false);
    };

    const saveScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await saveSchedule(userID, rememberMe);
        setLoading(false);
    };

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            const savedUserID = window.localStorage.getItem('userID');
            if (savedUserID != null) {
                // this `void` is for eslint "no floating promises"
                void loadScheduleAndSetLoading(savedUserID, true);
            }
        }
    }, []);

    return (
        <>
            <LoadSaveButtonBase
                actionName={'Save'}
                action={saveScheduleAndSetLoading}
                disabled={loading}
                loading={false}
                dialogText={'Enter your username here to save your schedule.'}
            />
            <LoadSaveButtonBase
                actionName={'Load'}
                action={loadScheduleAndSetLoading}
                disabled={false}
                loading={loading}
                dialogText={'Enter your username here to load your schedule.'}
            />
        </>
    );
};

export default LoadSaveButtonsCode;
