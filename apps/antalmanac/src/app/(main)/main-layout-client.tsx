'use client';

import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AutoSignIn } from '$components/AutoSignIn';
import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import { PatchNotes } from '$components/PatchNotes';
import { ReviewPrompt } from '$components/ReviewPrompt/ReviewPrompt';
import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import { hasAdvancedParams, hasManualParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readCourseSearchParams, readSearchMode } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { TutorialInitializer } from '$components/TutorialInitializer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$hooks/useKeyboardShortcutsModal';
import { PosthogPageviewTracker } from '$lib/analytics/PostHogPageviewTracker';
import { getWasLoggedIn } from '$lib/localStorage';
import { shouldSearchPlannerFromParams } from '$lib/plannerHelpers';
import { SeoContent } from '$src/app/(main)/seo-content';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { useSessionStore } from '$stores/SessionStore';
import { Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { usePathname, useRouter } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense, useCallback, useEffect, useRef } from 'react';
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

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const router = useRouter();
    const hasAppliedDefault = useRef(false);
    const { open: shortcutsOpen, closeModal: closeShortcutsModal } = useKeyboardShortcutsModal();

    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    useEffect(() => {
        if (!isMobile && pathname === '/calendar') {
            router.replace('/');
        }
    }, [isMobile, pathname, router]);

    useEffect(() => {
        if (hasAppliedDefault.current || pathname !== '/') {
            return;
        }

        hasAppliedDefault.current = true;

        const formData = readCourseSearchParams();
        const hasParams = hasManualParams(formData) || hasAdvancedParams(formData);
        const isManualSearchMode = readSearchMode() === COURSE_SEARCH_MODE.MANUAL;

        if (shouldSearchPlannerFromParams() || hasParams || isManualSearchMode) {
            return;
        }

        if (!isMobile) {
            const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
            if (hasSession) {
                router.replace('/added');
            }
            return;
        }

        const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
        const hasLocalScheduleData = AppStore.getAddedCourses().length > 0 || AppStore.getCustomEvents().length > 0;

        if (hasSession || hasLocalScheduleData) {
            router.replace('/calendar');
        }
    }, [isMobile, pathname, router]);

    return (
        <NuqsAdapter>
            <Suspense fallback={null}>
                <PosthogPageviewTracker />
            </Suspense>
            <AutoSignIn />
            <SeoContent />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TutorialInitializer />
                <PatchNotes />

                <Stack component="main" height="calc(100svh + env(safe-area-inset-top))">
                    <Header />
                    {isMobile ? <MobileHome /> : <DesktopHome />}
                </Stack>

                {children}

                <NotificationSnackbar />
                <ReviewPrompt />
                <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcutsModal} />
            </LocalizationProvider>
        </NuqsAdapter>
    );
}
