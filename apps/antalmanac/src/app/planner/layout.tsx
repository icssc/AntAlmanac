import { createPlannerCaller } from '$backend/planner/caller';

import '$planner/globals.scss';
import '$planner/App.scss';
import AppHeader from '$planner/component/AppHeader/AppHeader';
import AppProvider from '$planner/component/AppProvider/AppProvider';
import ChangelogModal from '$planner/component/ChangelogModal/ChangelogModal';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    subsets: ['latin'],
    variable: '--font-roboto',
    style: ['normal', 'italic'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'AntAlmanac Planner',
    description:
        'A web application for course discovery and planning at UCI, featuring an enhanced catalogue and a 4-year planner.',
};

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
    const plannerCaller = await createPlannerCaller();
    const user = await plannerCaller.users.get().catch(() => null);

    return (
        <>
            {/* Applies the persisted theme to the root element before the Planner
          content paints, avoiding a white flash in dark mode. */}
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script src="/planner/theme-script.js"></script>
            <AppProvider user={user}>
                <div id="root" className={roboto.variable}>
                    <AppHeader />
                    <div className="app-body">
                        <div className="app-content">{children}</div>
                        <ChangelogModal />
                    </div>
                </div>
            </AppProvider>
        </>
    );
}
