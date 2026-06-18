import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import { hasAdvancedParams, hasManualParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readCourseSearchParams, readSearchMode } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { getWasLoggedIn } from '$lib/localStorage';
import { shouldSearchPlannerFromParams } from '$lib/plannerHelpers';
import { useActiveTab } from '$lib/tabs/hooks';
import { TAB_HREF, type TabName } from '$lib/tabs/tabs';
import { useFallbackStore } from '$stores/FallbackStore';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { useSessionStore } from '$stores/SessionStore';
import { GlobalStyles, Stack } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export function ScheduleManagement() {
    const { tab } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const activeTab = useActiveTab();

    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const { saveSearch, popSavedSearch } = useSavedSearchStore(
        useShallow((store) => ({
            saveSearch: store.saveSearch,
            popSavedSearch: store.popSavedSearch,
        }))
    );

    // Tab name mapped to the last known scrollTop.
    const [positions, setPositions] = useState<Partial<Record<TabName, number>>>({});

    /**
     * Ref to the scrollable container with all of the tabs-content within it.
     */
    const ref = useRef<HTMLDivElement>(null);

    // Save the current scroll position to the store.
    const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const positionToSave = e.currentTarget.scrollTop;
        setPositions((current) => {
            current[activeTab] = positionToSave;
            return current;
        });
    };

    const handleTabChange = useCallback(
        (nextTab: TabName) => {
            if (activeTab === 'search' && nextTab !== 'search') {
                saveSearch();
            }

            if (nextTab === 'search') {
                popSavedSearch();
            }
        },
        [activeTab, popSavedSearch, saveSearch]
    );

    useEffect(() => {
        if (fallbackMode && tab !== 'added') {
            navigate(TAB_HREF.added, { replace: true });
            return;
        }

        if (!isMobile && tab === 'calendar') {
            navigate(TAB_HREF.search, { replace: true });
            return;
        }
    }, [tab, isMobile, fallbackMode, navigate]);

    useEffect(() => {
        if (fallbackMode || tab) {
            return;
        }

        const formData = readCourseSearchParams();
        const hasParams = hasManualParams(formData) || hasAdvancedParams(formData);
        const isManualSearchMode = readSearchMode() === COURSE_SEARCH_MODE.MANUAL;

        if (shouldSearchPlannerFromParams() || hasParams || isManualSearchMode) {
            return;
        }

        const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
        if (hasSession) {
            navigate(isMobile ? TAB_HREF.calendar : TAB_HREF.added, { replace: true });
            return;
        }

        // NB: `tab` and `navigate` are intentionally omitted from deps. `tab` so back-navigation
        // to `/` does not re-run defaults; `navigate` because useNavigate's identity changes per route.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, fallbackMode]);

    // Restore scroll position if it has been previously saved.
    useEffect(() => {
        const savedPosition = positions[activeTab];

        const animationFrame = requestAnimationFrame(() => {
            if (ref.current && savedPosition != null) {
                ref.current.scrollTop = savedPosition;
            }
        });

        return () => {
            if (animationFrame != null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [activeTab, positions]);

    return (
        <Stack direction="column" flexGrow={1} height="0">
            <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />

            {!isMobile && <ScheduleManagementTabs onTabChange={handleTabChange} />}

            <Stack width="100%" height="0" flexGrow={1} padding={1}>
                <Stack
                    id="course-pane-box"
                    direction="column"
                    overflow="auto"
                    height="0px"
                    flexGrow={1}
                    ref={ref}
                    onScroll={onScroll}
                >
                    <ScheduleManagementContent />
                </Stack>
            </Stack>

            {isMobile && <ScheduleManagementTabs onTabChange={handleTabChange} />}
        </Stack>
    );
}
