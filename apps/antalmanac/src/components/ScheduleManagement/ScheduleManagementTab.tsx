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
                    sx={(theme) => ({
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                        [theme.breakpoints.up('sm')]: {
                            flexDirection: 'row',
                            gap: 1,
                        },
                    })}
                >
                    <TabIcon />
                    {tab.label}
                </Box>
            }
            sx={(theme) => ({
                display: 'flex',
                minHeight: 'unset',
                minWidth: '25%',
                height: 56,
                [theme.breakpoints.up('sm')]: {
                    minHeight: 'auto',
                    height: '44px',
                    padding: 3,
                    minWidth: '33%',
                    ...(tab.mobileOnly ? { display: 'none' } : {}),
                },
            })}
            onClick={handleClick}
            value={value}
        />
    );
};
