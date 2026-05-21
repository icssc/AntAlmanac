import { hasSearchParams, useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { getWasLoggedIn } from '$lib/localStorage';
import { shouldSearchPlannerFromParams } from '$lib/plannerHelpers';
import AppStore from '$stores/AppStore';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { useSessionStore } from '$stores/SessionStore';
import { TAB_INDEX, useTabStore } from '$stores/TabStore';
import { GlobalStyles, Stack } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export function ScheduleManagement() {
    const { activeTab, setActiveTab, setActiveTabValue } = useTabStore(
        useShallow((store) => ({
            activeTab: store.activeTab,
            setActiveTab: store.setActiveTab,
            setActiveTabValue: store.setActiveTabValue,
        }))
    );
    const { tab } = useParams();
    const isMobile = useIsMobile();
    const { formData, manualSearchEnabled } = useCourseSearchUrlState();

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
                useSavedSearchStore.getState().saveSearch();
            }

            if (nextTab === TAB_INDEX.search) {
                useSavedSearchStore.getState().popSavedSearch();
            }

            setActiveTabValue(nextTab);
        },
        [activeTab, setActiveTabValue]
    );

    useEffect(() => {
        if (tab) {
            switch (tab) {
                case 'added':
                    setActiveTab('added');
                    break;
                case 'map':
                    setActiveTab('map');
                    break;
            }

            return;
        }

        if (shouldSearchPlannerFromParams()) {
            setActiveTab('search');
            return;
        }

        const hasSession = useSessionStore.getState().sessionIsValid || getWasLoggedIn();
        const hasLocalScheduleData = () =>
            AppStore.getAddedCourses().length > 0 || AppStore.getCustomEvents().length > 0;

        if (hasSearchParams(formData) || manualSearchEnabled) {
            setActiveTab('search');
            return;
        }

        if (!isMobile) {
            if (!hasSession) {
                setActiveTab('search');
            } else {
                setActiveTab('added');
            }
            return;
        }

        if (hasSession || hasLocalScheduleData()) {
            setActiveTab('calendar');
            return;
        }

        setActiveTab('search');
        // NB: We disable exhaustive deps here as `tab` is a dependency, but we only want this effect to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, setActiveTab]);

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
