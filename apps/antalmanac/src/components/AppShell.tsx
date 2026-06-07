'use client';

import '$src/App.css';
import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AutoSignIn } from '$components/AutoSignIn';
import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import type { PrefetchedSchedule } from '$lib/courseSearchQuery.server';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';
import { useEffect } from 'react';

const OUTAGE = false;

interface AppShellProps {
    prefetchedSchedule: PrefetchedSchedule;
    isAuthenticated: boolean;
}

/**
 * Client shell for the schedule planner. Keyboard shortcuts and analytics run here;
 * routing is handled by the Next.js App Router.
 */
export function AppShell({ prefetchedSchedule, isAuthenticated }: AppShellProps) {
    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    if (OUTAGE) {
        return <OutagePage />;
    }

    return (
        <>
            <PosthogPageviewTracker />
            <AutoSignIn />
            <Home prefetchedSchedule={prefetchedSchedule} isAuthenticated={isAuthenticated} />
        </>
    );
}
