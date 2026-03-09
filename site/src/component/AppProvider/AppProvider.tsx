'use client';

// Import Global Store
import { generateStore } from '../../store/store';
import { Provider } from 'react-redux';
import { PostHogProvider } from 'posthog-js/react';
import AppThemeProvider from '../AppThemeProvider/AppThemeProvider';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { useLoadSavedCourses } from '../../hooks/savedCourses';
import { useSetSchedule } from '../../hooks/schedule';
import { useLoadDepartments } from '../../hooks/departments';
import { UserData } from '@peterportal/types';
import { useLoadCompletedMarkers } from '../../hooks/courseRequirements';
import { useLoadTransferredCredits } from '../../hooks/transferCredits';
import PlannerLoader from '../../app/roadmap/planner/PlannerLoader';
import { AutoSignIn } from '../AutoSignIn/AutoSignIn';

const UserDataLoader: FC = () => {
  useLoadSavedCourses();
  useLoadCompletedMarkers();
  useLoadTransferredCredits();
  useSetSchedule();
  useLoadDepartments();
  return null;
};

const wrapInPostHogIfNeeded = (children: ReactNode) => {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!posthogHost || !posthogKey) {
    // Send warning about misconfiguration, though on development this can be safely ignored
    console.warn('PostHog Host or Key was not provided');
    return children;
  }

  const posthogOptions = { api_host: posthogHost, autocapture: true, enable_heatmaps: true };

  return (
    <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
      {children}
    </PostHogProvider>
  );
};

interface AppProviderProps extends PropsWithChildren {
  user: UserData | null;
}

const AppProvider: FC<AppProviderProps> = ({ children, user }) => {
  const baseContent = (
    <>
      <UserDataLoader />
      <AutoSignIn />
      <AppThemeProvider>
        <PlannerLoader />
        {children}
      </AppThemeProvider>
    </>
  );

  const appContent = wrapInPostHogIfNeeded(baseContent);
  const store = generateStore({
    user,
    theme: user?.theme ?? 'system',
    isAdmin: user?.isAdmin ?? false,
  });

  return <Provider store={store}>{appContent}</Provider>;
};

export default AppProvider;
