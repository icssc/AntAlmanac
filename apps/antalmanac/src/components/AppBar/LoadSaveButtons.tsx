import { useEffect, useState } from 'react';
import AppStore from "$stores/AppStore";
import LoadSaveButtonsAuth from "$components/AppBar/LoadSaveButtonsAuth";
import LoadSaveButtonsCode from "$components/AppBar/LoadSaveButtonsCode";

const LoadSaveButtons = () => {
    // Add a state to track authentication
    const [isAuthenticated, setIsAuthenticated] = useState(AppStore.isAuthedUser());

    useEffect(() => {
        // Subscribe to the usersAuthenticated event
        const handleUsersAuthenticated = () => {
            setIsAuthenticated(AppStore.isAuthedUser());
        };
        AppStore.on('userAuthChange', handleUsersAuthenticated);

        // Clean up by unsubscribing when the component unmounts
        return () => {
            AppStore.removeListener('userAuthChange', handleUsersAuthenticated);
        };
    }, []);

    // Conditionally render based on the authenticated state
    return isAuthenticated ? <LoadSaveButtonsAuth /> : <LoadSaveButtonsCode />
};

export default LoadSaveButtons;
