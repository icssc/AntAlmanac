import { AuthInitializer } from '$components/AuthInitializer';
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
import { CONTAINER_NAMES } from '$lib/containerQueries';
import { BLUE } from '$src/globals';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Split from 'react-split';

function MobileHome() {
    return (
        <Stack sx={{ containerType: 'inline-size', containerName: CONTAINER_NAMES.scheduleManagement, flexGrow: 1 }}>
            <ScheduleManagement />
        </Stack>
    );
}

function DesktopHome() {
    return (
        <Split
            sizes={[42.5, 57.5]}
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
                // gutter contents are slightly offset to the right, this centers the content
                paddingRight: '1px',
            })}
        >
            <Stack direction="column">
                <ScheduleCalendar />
            </Stack>
            <Stack
                direction="column"
                sx={{ containerType: 'inline-size', containerName: CONTAINER_NAMES.scheduleManagement }}
            >
                <ScheduleManagement />
            </Stack>
        </Split>
    );
}

export default function Home() {
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
