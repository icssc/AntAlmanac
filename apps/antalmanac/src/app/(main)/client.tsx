'use client';

import { redoDelete, undoDelete } from '$actions/AppStoreActions';
import { AuthInitializer } from '$components/AuthInitializer';
import { AutoSignIn } from '$components/AutoSignIn';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import { PatchNotes } from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import { Stack, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dynamic from 'next/dynamic';
import { useCallback, useEffect } from 'react';
import { Group, Panel, Separator, useGroupRef } from 'react-resizable-panels';

const ScheduleCalendar = dynamic(
    () => import('$components/Calendar/CalendarRoot').then((m) => ({ default: m.ScheduleCalendar })),
    { ssr: false }
);

const CALENDAR_PANEL_ID = 'calendar-pane';
const SCHEDULE_PANEL_ID = 'schedule-pane';
const SEPARATOR_ID = 'split-separator';

const DEFAULT_LAYOUT = {
    [CALENDAR_PANEL_ID]: 42.5,
    [SCHEDULE_PANEL_ID]: 57.5,
} as const;

// Below `sm`: hide calendar pane + separator, force schedule pane to fill.
// `!important` overrides inline styles set by react-resizable-panels.
const SplitGroup = styled(Group)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
        [`& #${CALENDAR_PANEL_ID}, & #${SEPARATOR_ID}`]: {
            display: 'none !important',
        },
        [`& #${SCHEDULE_PANEL_ID}`]: {
            flex: '1 1 0% !important',
        },
    },
}));

function Home() {
    const theme = useTheme();
    const groupRef = useGroupRef();

    const showCalendarPane = useMediaQuery(theme.breakpoints.up('sm'));

    const handleSeparatorDoubleClick = useCallback(() => {
        groupRef.current?.setLayout({ ...DEFAULT_LAYOUT });
    }, [groupRef]);

    return (
        <SplitGroup
            id="home-split"
            groupRef={groupRef}
            orientation="horizontal"
            defaultLayout={DEFAULT_LAYOUT}
            style={{ flexGrow: 1, marginTop: 4 }}
        >
            <Panel id={CALENDAR_PANEL_ID} minSize="400px" style={{ overflow: 'hidden' }}>
                <Stack direction="column" height="100%">
                    {showCalendarPane && <ScheduleCalendar />}
                </Stack>
            </Panel>

            <Separator
                id={SEPARATOR_ID}
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

            <Panel id={SCHEDULE_PANEL_ID} minSize="400px">
                <Stack direction="column" height="100%">
                    <ScheduleManagement />
                </Stack>
            </Panel>
        </SplitGroup>
    );
}

export default function Client() {
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
                <Home />
            </Stack>

            <NotificationSnackbar />
            <ReviewPrompt />
            <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcutsModal} />
        </LocalizationProvider>
    );
}
