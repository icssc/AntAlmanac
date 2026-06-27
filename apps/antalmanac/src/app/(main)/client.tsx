'use client';

import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AuthInitializer } from '$components/AuthInitializer';
import { AutoSignIn } from '$components/AutoSignIn';
import { DesktopSplit } from '$components/DesktopSplit';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import { PatchNotes } from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef } from 'react';

const ScheduleCalendar = dynamic(
    () => import('$components/Calendar/CalendarRoot').then((m) => ({ default: m.ScheduleCalendar })),
    { ssr: false }
);

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
        <DesktopSplit
            left={<ScheduleCalendar />}
            right={<ScheduleManagement />}
            rightPaneRef={scheduleManagementRef}
            onRightPaneResize={handleDrag}
        />
    );
}

export default function Client() {
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AutoSignIn />
            <TutorialInitializer />
            <AuthInitializer />
            <PatchNotes />

            <Stack component="main" height="calc(100svh - 52px - env(safe-area-inset-top))">
                {isMobile ? <MobileHome /> : <DesktopHome />}
            </Stack>

            <NotificationSnackbar />
            <ReviewPrompt />
            <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcutsModal} />
        </LocalizationProvider>
    );
}
