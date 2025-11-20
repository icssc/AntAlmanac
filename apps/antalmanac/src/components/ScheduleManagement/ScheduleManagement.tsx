import { GlobalStyles, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { getLocalStorageSessionId } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { paramsAreInURL } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export function ScheduleManagement() {
    const { activeTab, setActiveTab } = useTabStore();
    const { tab } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

        const sessionId = getLocalStorageSessionId();
        const urlHasManualSearchParams = paramsAreInURL();
        const hasLocalScheduleData = () =>
            AppStore.getAddedCourses().length > 0 || AppStore.getCustomEvents().length > 0;

        if (urlHasManualSearchParams) {
            setActiveTab('search');
            return;
        }

        if (!isMobile) {
            if (sessionId === null) {
                setActiveTab('search');
            } else {
                setActiveTab('added');
            }
            return;
        }

        if (sessionId !== null || hasLocalScheduleData()) {
            setActiveTab('calendar');
            return;
        }

        setActiveTab('search');

        const tryToShowCalendar = () => {
            if (!hasLocalScheduleData()) {
                return;
            }

            setActiveTab('calendar');
            AppStore.off('addedCoursesChange', tryToShowCalendar);
            AppStore.off('customEventsChange', tryToShowCalendar);
        };

        AppStore.on('addedCoursesChange', tryToShowCalendar);
        AppStore.on('customEventsChange', tryToShowCalendar);

        return () => {
            AppStore.off('addedCoursesChange', tryToShowCalendar);
            AppStore.off('customEventsChange', tryToShowCalendar);
        };
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

            {!isMobile && <ScheduleManagementTabs />}

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

            {isMobile && <ScheduleManagementTabs />}
        </Stack>
    );
}
