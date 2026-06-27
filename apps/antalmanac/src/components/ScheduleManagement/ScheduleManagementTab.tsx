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
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: { xs: 0.25, sm: 1 },
                    }}
                >
                    <TabIcon />
                    {tab.label}
                </Box>
            }
            sx={{
                minHeight: { xs: 'unset', sm: 'auto' },
                height: { xs: 56, sm: '44px' },
                padding: { xs: undefined, sm: 3 },
                minWidth: { xs: '25%', sm: '33%' },
                display: tab.mobileOnly ? { xs: 'flex', sm: 'none' } : 'flex',
            }}
            onClick={handleClick}
            value={value}
        />
    );
};
