import React, { useEffect, useState } from 'react';
import { checkUser, saveGoogleUser, loadGoogleUser, loadSchedule, login } from '../../actions/AppStoreActions';
import { LoadSchedule, SaveSchedule } from './LoadSaveFunctionality';
import GoogleAccountBase from './AccountBase';
import { Button } from '@material-ui/core';
import { AssignmentReturned, Save } from '@material-ui/icons';
import { saveSchedule } from '../../actions/AppStoreActions';

const ScheduleLoginManager = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const setupUser = async () => {
            const user = await checkUser();
            setUser(user);
            if (!user || !(await loadGoogleUser(user))) {
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
            {user ? (
                <>
                    <GoogleAccountBase user={user} />
                    <Button onClick={() => saveGoogleUser(user)} color="inherit" startIcon={<Save />}>
                        Save
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={login} color="inherit" startIcon={<AssignmentReturned />}>
                        Login
                    </Button>
                    <SaveSchedule saveFunction={saveSchedule} />
                    <LoadSchedule />
                </>
            )}
        </>
    );
};

export default ScheduleLoginManager;
