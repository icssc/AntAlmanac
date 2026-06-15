import { AutoSignIn } from '$components/AutoSignIn';
import { PosthogPageviewTracker } from '$lib/analytics/PostHogPageviewTracker';
import { ErrorPage } from '$routes/ErrorPage';
import { Home } from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const ROUTER_OPTIONS = {
    future: {
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_relativeSplatPath: true,
        v7_skipActionErrorRevalidation: true,
    },
} as const;

function RouteLayout() {
    return (
        <NuqsAdapter>
            <PosthogPageviewTracker />
            <AutoSignIn />
            <Outlet />
        </NuqsAdapter>
    );
}

const HOME_PAGE = <Home />;

export const appRouter = createBrowserRouter(
    [
        {
            element: <RouteLayout />,
            children: [
                {
                    path: '/',
                    element: HOME_PAGE,
                    errorElement: <ErrorPage />,
                },
                {
                    path: '/:tab',
                    element: HOME_PAGE,
                    errorElement: <ErrorPage />,
                },
                {
                    path: '*',
                    element: <Navigate to="/" replace />,
                },
            ],
        },
    ],
    ROUTER_OPTIONS
);

export const outageRouter = createBrowserRouter(
    [
        {
            element: <RouteLayout />,
            children: [
                {
                    path: '/outage',
                    element: <OutagePage />,
                    errorElement: <ErrorPage />,
                },
                {
                    path: '*',
                    element: <Navigate to="/outage" replace />,
                },
            ],
        },
    ],
    ROUTER_OPTIONS
);

const OUTAGE = false;

export const router = OUTAGE ? outageRouter : appRouter;
