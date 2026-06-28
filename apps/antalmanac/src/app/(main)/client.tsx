'use client';

import { redoDelete, undoDelete } from '$actions/AppStoreActions';
import { AuthInitializer } from '$components/AuthInitializer';
import { AutoSignIn } from '$components/AutoSignIn';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import { PatchNotes } from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import { BLUE } from '$src/globals';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCallback, useEffect, useState } from 'react';
import Split from 'react-split';

const DEFAULT_SPLIT_SIZES: [number, number] = [42.5, 57.5];

function MobileHome() {
    return <ScheduleManagement />;
}

function DesktopHome() {
    const [sizes, setSizes] = useState<number[]>(DEFAULT_SPLIT_SIZES);

    const gutter = useCallback((_index: number, direction: string) => {
        const el = document.createElement('div');
        el.className = `gutter gutter-${direction}`;
        el.addEventListener('dblclick', () => setSizes(DEFAULT_SPLIT_SIZES));
        return el;
    }, []);

    return (
        <Split
            sizes={sizes}
            minSize={400}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={0}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', flexGrow: 1, marginTop: 4 }}
            gutter={gutter}
            gutterStyle={() => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            })}
            onDragEnd={setSizes}
        >
            <Stack direction="column">
                <ScheduleCalendar />
            </Stack>
            <Stack direction="column">
                <ScheduleManagement />
            </Stack>
        </Split>
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
