'use client';

import { UserData } from '@peterportal/types';
import { FC, PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';

import PlannerLoader from '../../app/roadmap/planner/PlannerLoader';
import { useLoadCompletedMarkers, useLoadOverriddenRequirements } from '../../hooks/courseRequirements';
import { useLoadDepartments } from '../../hooks/departments';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import { useLoadSavedCourses } from '../../hooks/savedCourses';
import { useSetSchedule } from '../../hooks/schedule';
import { useLoadTransferredCredits } from '../../hooks/transferCredits';
import { useAppDispatch } from '../../store/hooks';
import { setAutosaveEnabled } from '../../store/slices/userSlice';
// Import Global Store
import { generateStore } from '../../store/store';
import AppThemeProvider from '../AppThemeProvider/AppThemeProvider';
import { AutoSignIn } from '../AutoSignIn/AutoSignIn';

const UserDataLoader: FC = () => {
    useLoadSavedCourses();
    useLoadCompletedMarkers();
    useLoadOverriddenRequirements();
    useLoadTransferredCredits();
    useSetSchedule();
    useLoadDepartments();

    const dispatch = useAppDispatch();
    const isLoggedIn = useIsLoggedIn();
    useEffect(() => {
        if (!isLoggedIn) {
            dispatch(setAutosaveEnabled(localStorage.getItem('autosaveEnabled') === 'true'));
        }
    }, [isLoggedIn, dispatch]);

    return null;
};

interface AppProviderProps extends PropsWithChildren {
    user: UserData | null;
}

const AppProvider: FC<AppProviderProps> = ({ children, user }) => {
    const appContent = (
        <>
            <UserDataLoader />
            <AutoSignIn />
            <AppThemeProvider>
                <PlannerLoader />
                {children}
            </AppThemeProvider>
        </>
    );

    const store = generateStore({
        user,
        theme: user?.theme ?? 'system',
        isAdmin: user?.isAdmin ?? false,
        autosaveEnabled: user?.autoSaveEnabled ?? false,
    });

    return <Provider store={store}>{appContent}</Provider>;
};

export default AppProvider;
