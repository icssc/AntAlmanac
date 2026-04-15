import '@peterportal/site/src/globals.scss';
import '@peterportal/site/src/App.scss';
import AppHeader from '@peterportal/site/src/component/AppHeader/AppHeader';
import AppProvider from '@peterportal/site/src/component/AppProvider/AppProvider';
import ChangelogModal from '@peterportal/site/src/component/ChangelogModal/ChangelogModal';
import { createServerSideTrpcCaller } from '@peterportal/site/src/trpc';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { headers } from 'next/headers';

const roboto = Roboto({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'AntAlmanac Planner',
    description:
        'A web application for course discovery and planning at UCI, featuring an enhanced catalogue and a 4-year planner.',
};

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);
    const user = await serverTrpc.users.get.query().catch(() => null);

    return (
        <AppProvider user={user}>
            <div id="root" className={roboto.className} style={{ fontSize: '16px' }}>
                <AppHeader />
                <div className="app-body">
                    <div className="app-content">{children}</div>
                    <ChangelogModal />
                </div>
            </div>
        </AppProvider>
    );
}
