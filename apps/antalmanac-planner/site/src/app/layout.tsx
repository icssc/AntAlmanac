import type { Metadata } from 'next';

import '../globals.scss';
import '../App.scss';

import AppHeader from '../component/AppHeader/AppHeader';
import ChangelogModal from '../component/ChangelogModal/ChangelogModal';

// Import Global Store
import AppProvider from '../component/AppProvider/AppProvider';
import { createServerSideTrpcCaller } from '../trpc';
import { headers } from 'next/headers';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
  const serverTrpc = createServerSideTrpcCaller(reqHeaders);
  const user = await serverTrpc.users.get.query().catch(() => null);

  return (
    <html lang="en" data-theme={user?.theme} className={roboto.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="AntAlmanac Planner" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/planner/theme-script.js"></script>
        {/* This script must run and apply styles to the root HTML element before the
        <body> tag opens to avoid an unstyled body tag causing a white flash in dark mode */}
      </head>
      <body>
        <AppProvider user={user}>
          <div id="root">
            <AppHeader />
            <div className="app-body">
              <div className="app-content">{children}</div>
              <ChangelogModal />
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
