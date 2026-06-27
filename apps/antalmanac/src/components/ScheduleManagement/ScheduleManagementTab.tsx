import { useIsMobile } from '$hooks/useIsMobile';
import { TAB_INDEX, type TabInfo, type TabName } from '$lib/tabs/tabs';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Box, Tab } from '@mui/material';
import Link from 'next/link';

interface ScheduleManagementTabProps {
    tab: TabInfo;
    value: number;
    onTabChange: (tabName: TabName) => void;
}

export const ScheduleManagementTab = ({ tab, value, onTabChange }: ScheduleManagementTabProps) => {
    const isMobile = useIsMobile();
    const savedSearch = useSavedSearchStore((store) => store.savedSearch);

    const href = value === TAB_INDEX.search && savedSearch ? `${tab.href}${savedSearch}` : tab.href || '/';

    const handleClick = () => {
        onTabChange(tab.name);
    };

    const TabIcon = tab.icon;

    return (
        <Tab
            id={tab.id}
            component={Link}
            href={href}
            label={
                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        gap: isMobile ? 0.25 : 1,
                    }}
                >
                    <TabIcon />
                    {tab.label}
                </Box>
            }
            sx={{
                ...(isMobile
                    ? {
                          minHeight: 'unset',
                          minWidth: '25%',
                          height: 56,
                      }
                    : {
                          minHeight: 'auto',
                          height: '44px',
                          padding: 3,
                          minWidth: '33%',
                      }),
                display: isMobile || !tab.mobileOnly ? 'flex' : 'none',
            }}
            onClick={handleClick}
            value={value}
        />
    );
};
