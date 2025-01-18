import { GlobalStyles, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { getLocalStorageUserId } from '$lib/localStorage';
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

    // Change the tab to the "added classes" tab if the user was previously logged in.
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

        const userId = getLocalStorageUserId();

        if (userId === null) {
            setActiveTab('search');
        } else if (isMobile) {
            setActiveTab('calendar');
        } else {
            setActiveTab('added');
        }
    }, [setActiveTab]);

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
