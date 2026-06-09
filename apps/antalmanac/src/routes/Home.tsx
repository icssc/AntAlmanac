import { AuthInitializer } from '$components/AuthInitializer';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import Split from 'react-split';

const DEFAULT_SPLIT_SIZES: [number, number] = [42.5, 57.5];

function MobileHome() {
    return <ScheduleManagement />;
}

function DesktopHome() {
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const [sizes, setSizes] = useState<number[]>(DEFAULT_SPLIT_SIZES);
    const scheduleManagementRef = useRef<HTMLDivElement>(null);

    const gutter = useCallback((_index: number, direction: string) => {
        const el = document.createElement('div');
        el.className = `gutter gutter-${direction}`;
        el.addEventListener('dblclick', () => setSizes(DEFAULT_SPLIT_SIZES));
        return el;
    }, []);

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
                // gutter contents are slightly offset to the right, this centers the content
                paddingRight: '1px',
            })}
            onDrag={handleDrag}
            onDragEnd={setSizes}
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

export function Home() {
    const isMobile = useIsMobile();
    const { open: shortcutsOpen, closeModal: closeShortcutsModal } = useKeyboardShortcutsModal();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TutorialInitializer />
            <AuthInitializer />
            <PatchNotes />

            <Stack component="main" height="calc(100svh + env(safe-area-inset-top))">
                <Header />
                {isMobile ? <MobileHome /> : <DesktopHome />}
            </Stack>

            <NotificationSnackbar />
            <ReviewPrompt />
            <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcutsModal} />
        </LocalizationProvider>
    );
}
