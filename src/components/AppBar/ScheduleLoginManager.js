import React, { useEffect, useState } from 'react';
import AppStore from '../../stores/AppStore';
import dispatcher from '../../dispatcher';
import {
    checkUser,
    saveGoogleUser,
    loadGoogleUser,
    loadSchedule,
    login,
    loadLocalSchedule,
    compileUserData,
} from '../../actions/AppStoreActions';
import { LoadSchedule, SaveSchedule } from './LoadSaveFunctionality';
import GoogleAccountBase from './AccountBase';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { AssignmentReturned, Save } from '@material-ui/icons';
import { saveSchedule } from '../../actions/AppStoreActions';

const ScheduleLoginManager = () => {
    const [user, setUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const setupUser = async () => {
            // See if there is a google user
            const user = await checkUser();
            setUser(user);

            // Load the Google user's schedule
            // didLoadGoogleUser is a boolean representing successful load
            const didLoadGoogleUser = user && (await loadGoogleUser(user));

            if (typeof Storage !== 'undefined') {
                // HANDLING LEGACY SCHEDULES
                // If there is no google user but a legacy schedule exists,
                // load it that schedule
                const legacyUserId = window.localStorage.getItem('userID');
                if (!didLoadGoogleUser && legacyUserId != null) {
                    loadSchedule(legacyUserId, true);
                }

                // HANDLING TEMP USER DATA
                // If there is tempUserData, those schedules should be appended onto the userData
                // After we've successfully loaded that temporary schedule, we can remove it from local storage
                const tempUserData = window.localStorage.getItem('tempUserData');
                if (tempUserData != null) {
                    const userData = compileUserData();
                    const oldData = JSON.parse(tempUserData);

                    oldData.addedCourses = oldData.addedCourses.map((course) => {
                        // Course schedule indices must be offset to account for existing schedules
                        // Add the current number of schedules onto the index
                        return {
                            ...course,
                            scheduleIndices: course.scheduleIndices.map(
                                (index) => (index += userData.scheduleNames.length)
                            ),
                        };
                    });
                    oldData.customEvents = oldData.customEvents.map((event) => {
                        // Custom event indices must be offset to account for existing schedules
                        // Add the current number of schedules onto the index
                        return {
                            ...event,
                            scheduleIndices: event.scheduleIndices.map(
                                (index) => (index += userData.scheduleNames.length)
                            ),
                        };
                    });

                    // Add the cached data onto userData
                    userData.addedCourses = userData.addedCourses.concat(oldData.addedCourses);
                    userData.scheduleNames = userData.scheduleNames.concat(oldData.scheduleNames);
                    userData.customEvents = userData.customEvents.concat(oldData.customEvents);

                    // Load the combined data
                    await loadLocalSchedule(userData);
                    window.localStorage.removeItem('tempUserData');

                    // Save the new combined schedules to the google account
                    saveGoogleUser(user);
                }
            }
        };

        // Call the setup function (we need to do it like this since it's async)
        setupUser();
    }, []);

    /**
     * HANDLE LOGIN
     *
     * On login, if there are unsaved changes or an existing schedule,
     * ask the user if they want to import the schedules
     * Else contine with the login process
     */
    const handleLogin = () => {
        if (AppStore.hasUnsavedChanges() || window.localStorage.getItem('userID') !== null) {
            setDialogOpen(true);
        } else {
            login();
        }
    };

    /**
     * CACHE SCHEDULE
     *
     * Saves the current schedules to local storage under 'tempUserData'
     * Then sends a CACHE_SCHEDULE dispatch to supress the unsaved_changes warning
     */
    const cacheSchedule = () => {
        const userData = compileUserData();
        window.localStorage.setItem('tempUserData', JSON.stringify(userData));

        dispatcher.dispatch({
            type: 'CACHE_SCHEDULE',
        });
    };

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
                    <Button onClick={handleLogin} color="inherit" startIcon={<AssignmentReturned />}>
                        Login
                    </Button>
                    <SaveSchedule saveFunction={saveSchedule} />
                    <LoadSchedule />

                    {/* Import Current Schedule Dialog Box  */}
                    <Dialog open={dialogOpen}>
                        <DialogTitle>Before logging in, should we import current schedules?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Would you like to import these current schedules into your AntAlmanac profile?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    cacheSchedule();
                                    window.localStorage.removeItem('userID');
                                    login();
                                }}
                                color="primary"
                            >
                                Import
                            </Button>
                            <Button
                                onClick={() => {
                                    login();
                                    setDialogOpen(false);
                                }}
                            >
                                Don't Import
                            </Button>
                            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};

export default ScheduleLoginManager;
