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
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { Stack, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dynamic from 'next/dynamic';
import { useCallback, useEffect } from 'react';
import { Group, Panel, Separator, useGroupRef, type PanelSize } from 'react-resizable-panels';

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
    const theme = useTheme();
    const groupRef = useGroupRef();
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const handleSchedulePanelResize = useCallback(
        (panelSize: PanelSize) => {
            setScheduleManagementWidth(panelSize.inPixels);
        },
        [setScheduleManagementWidth]
    );

    const handleSeparatorDoubleClick = useCallback(() => {
        groupRef.current?.setLayout({ ...DEFAULT_LAYOUT });
    }, [groupRef]);

    return (
        <Group
            id="desktop-split"
            groupRef={groupRef}
            orientation="horizontal"
            defaultLayout={DEFAULT_LAYOUT}
            style={{ flexGrow: 1, marginTop: 4 }}
        >
            <Panel
                id={CALENDAR_PANEL_ID}
                defaultSize={`${DEFAULT_LAYOUT[CALENDAR_PANEL_ID]}%`}
                minSize="400px"
                style={{ overflow: 'hidden' }}
            >
                <Stack direction="column" height="100%">
                    <ScheduleCalendar />
                </Stack>
            </Panel>

            <Separator
                disableDoubleClick
                onDoubleClick={handleSeparatorDoubleClick}
                style={{
                    width: 10,
                    paddingRight: 1,
                    boxSizing: 'border-box',
                    alignSelf: 'stretch',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.vars.palette.primary.main,
                    color: theme.vars.palette.primary.contrastText,
                    fontSize: 30,
                    lineHeight: 1,
                    userSelect: 'none',
                    cursor: 'col-resize',
                }}
            >
                ⋮
            </Separator>

            <Panel
                id={SCHEDULE_PANEL_ID}
                defaultSize={`${DEFAULT_LAYOUT[SCHEDULE_PANEL_ID]}%`}
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
