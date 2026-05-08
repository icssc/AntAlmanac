'use client';

import './HomeShell.css';
import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AutoSignIn } from '$components/AutoSignIn';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import { BLUE } from '$src/globals';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { TourProvider } from '@reactour/tour';
import { useCallback, useEffect, useRef } from 'react';
import Split from 'react-split';

function MobileHome() {
    return <ScheduleManagement />;
}

function DesktopHome() {
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const scheduleManagementRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback(() => {
        const scheduleManagementElement = scheduleManagementRef.current;
        if (!scheduleManagementElement) {
            return;
        }

        const elementWidth = scheduleManagementElement.getBoundingClientRect().width;
        setScheduleManagementWidth(elementWidth);
    }, [setScheduleManagementWidth]);

    useEffect(() => {
        handleDrag();

        window.addEventListener('resize', handleDrag);

        return () => {
            window.removeEventListener('resize', handleDrag);
        };
    }, [handleDrag]);

    return (
        <Split
            sizes={[45, 55]}
            minSize={400}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={0}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', flexGrow: 1, marginTop: 4 }}
            gutterStyle={() => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            })}
            onDrag={handleDrag}
        >
            <Stack direction="column">
                <ScheduleCalendar />
            </Stack>
            <Stack direction="column" ref={scheduleManagementRef}>
                <ScheduleManagement />
            </Stack>
        </Split>
    );
}

export function HomeShell() {
    const isMobile = useIsMobile();
    const { open: shortcutsOpen, closeModal: closeShortcutsModal } = useKeyboardShortcutsModal();

    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    return (
        <TourProvider
            steps={[]}
            padding={5}
            styles={{
                maskArea: (base) => ({
                    ...base,
                    rx: 5,
                }),
                maskWrapper: (base) => ({
                    ...base,
                    color: 'rgba(0, 0, 0, 0.3)',
                }),
                popover: (base) => ({
                    ...base,
                    background: '#fff',
                    color: 'black',
                    borderRadius: 5,
                    boxShadow: '0 0 10px #000',
                    padding: 20,
                    paddingTop: 40,
                    margin: '4px 20px 20px 20px',
                }),
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <PosthogPageviewTracker />
                <AutoSignIn />
                <TutorialInitializer />
                <PatchNotes />

                <Stack component="main" height="calc(100svh + env(safe-area-inset-top))">
                    <Header />
                    {isMobile ? <MobileHome /> : <DesktopHome />}
                </Stack>

                <NotificationSnackbar />
                <ReviewPrompt />
                <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcutsModal} />
            </LocalizationProvider>
        </TourProvider>
    );
}
