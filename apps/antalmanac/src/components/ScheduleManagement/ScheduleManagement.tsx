import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import { hasAdvancedParams, hasManualParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readCourseSearchParams, readSearchMode } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { getWasLoggedIn } from '$lib/localStorage';
import { shouldSearchPlannerFromParams } from '$lib/plannerHelpers';
import { useActiveTabIndex } from '$lib/tabs/hooks';
import { TAB_INDEX, getTabHref } from '$lib/tabs/tabs';
import AppStore from '$stores/AppStore';
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
    const activeTab = useActiveTabIndex();

    const { saveSearch, popSavedSearch } = useSavedSearchStore(
        useShallow((store) => ({
            saveSearch: store.saveSearch,
            popSavedSearch: store.popSavedSearch,
        }))
    );

    // Tab index mapped to the last known scrollTop.
    const [positions, setPositions] = useState<Record<number, number>>({});

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
        (nextTab: number) => {
            if (activeTab === TAB_INDEX.search && nextTab !== TAB_INDEX.search) {
                saveSearch();
            }

            if (nextTab === TAB_INDEX.search) {
                popSavedSearch();
            }
        },
        [activeTab, popSavedSearch, saveSearch]
    );

    // Calendar is mobile-only — desktop always shows it in the split pane.
    useEffect(() => {
        if (!isMobile && tab === 'calendar') {
            navigate('/', { replace: true });
        }
    }, [tab, isMobile, navigate]);

    // Pick a default tab on first visit to `/`.
    useEffect(() => {
        if (tab) {
            return;
        }

        const formData = readCourseSearchParams();
        const hasParams = hasManualParams(formData) || hasAdvancedParams(formData);
        const isManualSearchMode = readSearchMode() === COURSE_SEARCH_MODE.MANUAL;

        if (shouldSearchPlannerFromParams() || hasParams || isManualSearchMode) {
            return;
        }

        if (!isMobile) {
            const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
            if (hasSession) {
                navigate(getTabHref('added'), { replace: true });
            }
            return;
        }

        const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
        const hasLocalScheduleData = AppStore.getAddedCourses().length > 0 || AppStore.getCustomEvents().length > 0;

        if (hasSession || hasLocalScheduleData) {
            navigate(getTabHref('calendar'), { replace: true });
        }

        // NB: We disable exhaustive deps here as `tab` is a dependency, but we only want this effect to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, navigate]);

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
