import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { type ReactNode } from 'react';

import { Header } from '$components/Header/Header';
import { HelpMenu } from '$components/HelpMenu/HelpMenu';
import InstallPWABanner from '$components/InstallPWABanner';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';

interface Props {
    children: ReactNode;
    /** When true, the header is hidden (e.g. shared schedule error state). */
    hideHeader?: boolean;
}

/**
 * Wraps components common to all pages that should look and feel like the home page.
 *
 * @param children The body of the page, usually the desktop/home components
 * plus whatever a page might want to add on to that.
 */
function HomePageWrapper({ children, hideHeader }: Props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <PatchNotes />
            <InstallPWABanner />

            <Stack component="main" height="calc(100svh + env(safe-area-inset-top))">
                {!hideHeader && <Header />}
                {children}
            </Stack>

            <NotificationSnackbar />
            <HelpMenu />
        </LocalizationProvider>
    );
}

export default HomePageWrapper;
