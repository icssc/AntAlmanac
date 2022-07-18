import React, { useEffect, useState } from 'react';
import { checkUser, loadUser, loadSchedule } from '../../actions/AppStoreActions';
import { LoadSchedule, SaveSchedule } from './LoadSaveFunctionality';
import AccountBase from './AccountBase';

const ScheduleLoginManager = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const setupUser = async () => {
            const user = await checkUser();
            setUser(user);
            if (!user || !(await loadUser(user))) {
                if (typeof Storage !== 'undefined') {
                    const savedUserID = window.localStorage.getItem('userID');
                    if (savedUserID != null) {
                        loadSchedule(savedUserID, true);
                    }
                }
            }
        };

        setupUser();
    }, []);

    return (
        <>
            <AccountBase user={user} />
            {user ? (
                <LoadSchedule />
            ) : (
                <>
                    <SaveSchedule />
                    <LoadSchedule />
                </>
            )}
        </>
    );
};

export default ScheduleLoginManager;
