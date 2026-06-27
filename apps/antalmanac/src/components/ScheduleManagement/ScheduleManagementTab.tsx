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
                        flexDirection: { default: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: { default: 0.25, sm: 1 },
                    }}
                >
                    <TabIcon fontSize="inherit" />
                    {tab.label}
                </Box>
            }
            sx={{
                minHeight: { default: 'unset', sm: 'auto' },
                minWidth: { default: '25%', sm: '33%' },
                height: { default: 56, sm: 44 },
                padding: { sm: 3 },
                display: tab.mobileOnly ? { default: 'flex', sm: 'none' } : 'flex',
            }}
            onClick={handleClick}
            value={value}
        />
    );
};
