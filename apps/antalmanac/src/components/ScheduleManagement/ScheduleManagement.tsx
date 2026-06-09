import { ScheduleManagementContent } from '$components/ScheduleManagement/ScheduleManagementContent';
import { ScheduleManagementTabs } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { TAB_INDEX, tabFromPathname } from '$src/tabs';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { GlobalStyles, Stack } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

/**
 * List of interactive tab buttons with their accompanying content.
 * Each tab's content has functionality for managing the user's schedule.
 */
export function ScheduleManagement() {
    const pathname = usePathname();
    const activeTab = TAB_INDEX[tabFromPathname(pathname)];
    const isMobile = useIsMobile();

    const { saveSearch, popSavedSearch } = useSavedSearchStore(
        useShallow((store) => ({
            saveSearch: store.saveSearch,
            popSavedSearch: store.popSavedSearch,
        }))
    );

    const [positions, setPositions] = useState<Record<number, number>>({});
    const ref = useRef<HTMLDivElement>(null);

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

            {!isMobile && <ScheduleManagementTabs activeTab={activeTab} onTabChange={handleTabChange} />}

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
                    <ScheduleManagementContent activeTab={activeTab} />
                </Stack>
            </Stack>

            {isMobile && <ScheduleManagementTabs activeTab={activeTab} onTabChange={handleTabChange} />}
        </Stack>
    );
}
