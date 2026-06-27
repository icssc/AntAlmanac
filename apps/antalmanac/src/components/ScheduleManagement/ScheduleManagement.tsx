import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { useActiveTab } from '$lib/tabs/hooks';
import { TAB_HREF, type TabName } from '$lib/tabs/tabs';
import { useFallbackStore } from '$stores/FallbackStore';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Box, GlobalStyles, Stack } from '@mui/material';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export function ScheduleManagement() {
    const segment = useSelectedLayoutSegment();
    const router = useRouter();
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
                saveSearch(globalThis.location.search);
            }

            if (nextTab === 'search') {
                popSavedSearch();
            }
        },
        [activeTab, popSavedSearch, saveSearch]
    );

    useEffect(() => {
        if (fallbackMode && segment !== 'added') {
            router.replace(TAB_HREF.added);
            return;
        }

        if (!isMobile && segment === 'calendar') {
            router.replace(TAB_HREF.search);
        }
    }, [segment, isMobile, fallbackMode, router]);

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

            <Box sx={{ order: { default: 1, sm: 0 } }}>
                <ScheduleManagementTabs onTabChange={handleTabChange} />
            </Box>

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
        </Stack>
    );
}
