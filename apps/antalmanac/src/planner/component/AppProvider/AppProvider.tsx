'use client';

import PlannerLoader from '$plannerApp/roadmap/planner/PlannerLoader';
import { type UserData } from '@packages/planner-types';
import { type FC, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { useLoadCompletedMarkers, useLoadOverriddenRequirements } from '../../hooks/courseRequirements';
import { useLoadDepartments } from '../../hooks/departments';
import { useLoadSavedCourses } from '../../hooks/savedCourses';
import { useSetSchedule } from '../../hooks/schedule';
import { useLoadTransferredCredits } from '../../hooks/transferCredits';
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
    return null;
};

interface AppProviderProps extends PropsWithChildren {
    user: UserData | null;
}

/**
 * Planner-specific providers. PostHog is intentionally NOT initialized here —
 * the merged app's root layout already provides a single PostHog instance
 * for every route, including the Planner.
 */
const AppProvider: FC<AppProviderProps> = ({ children, user }) => {
    const store = generateStore({
        user,
        theme: user?.theme ?? 'system',
        isAdmin: user?.isAdmin ?? false,
    });

    return (
        <Provider store={store}>
            <UserDataLoader />
            <AutoSignIn />
            <AppThemeProvider>
                <PlannerLoader />
                {children}
            </AppThemeProvider>
        </Provider>
    );
};

export default AppProvider;
