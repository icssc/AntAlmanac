'use client';

import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AuthInitializer } from '$components/AuthInitializer';
import { AutoSignIn } from '$components/AutoSignIn';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import { PatchNotes } from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import { BLUE } from '$src/globals';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef } from 'react';
import { Group, Panel, Separator, type PanelSize } from 'react-resizable-panels';

const ScheduleCalendar = dynamic(
    () => import('$components/Calendar/CalendarRoot').then((m) => ({ default: m.ScheduleCalendar })),
    { ssr: false }
);

const CALENDAR_PANEL_ID = 'calendar';
const SCHEDULE_PANEL_ID = 'schedule';

const DEFAULT_LAYOUT = {
    [CALENDAR_PANEL_ID]: 42.5,
    [SCHEDULE_PANEL_ID]: 57.5,
} as const;

function MobileHome() {
    return <ScheduleManagement />;
}

function DesktopHome() {
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const schedulePanelRef = useRef<HTMLDivElement>(null);

    const syncSchedulePanelWidth = useCallback(() => {
        const schedulePanel = schedulePanelRef.current;
        if (!schedulePanel) {
            return;
        }

        setScheduleManagementWidth(schedulePanel.getBoundingClientRect().width);
    }, [setScheduleManagementWidth]);

    const handleSchedulePanelResize = useCallback(
        (panelSize: PanelSize) => {
            setScheduleManagementWidth(panelSize.inPixels);
        },
        [setScheduleManagementWidth]
    );

    useEffect(() => {
        syncSchedulePanelWidth();

        window.addEventListener('resize', syncSchedulePanelWidth);

        return () => {
            window.removeEventListener('resize', syncSchedulePanelWidth);
        };
    }, [syncSchedulePanelWidth]);

    return (
        <Group
            id="desktop-split"
            orientation="horizontal"
            defaultLayout={DEFAULT_LAYOUT}
            style={{ flexGrow: 1, marginTop: 4 }}
        >
            <Panel id={CALENDAR_PANEL_ID} defaultSize={42.5} minSize={400} style={{ overflow: 'hidden' }}>
                <Stack direction="column" height="100%">
                    <ScheduleCalendar />
                </Stack>
            </Panel>

            <Separator
                className="gutter gutter-horizontal"
                style={{
                    width: 10,
                    backgroundColor: BLUE,
                    paddingRight: '1px',
                }}
            />

            <Panel
                id={SCHEDULE_PANEL_ID}
                defaultSize={57.5}
                elementRef={schedulePanelRef}
                onResize={handleSchedulePanelResize}
            >
                <Stack direction="column" height="100%">
                    <ScheduleManagement />
                </Stack>
            </Panel>
        </Group>
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
