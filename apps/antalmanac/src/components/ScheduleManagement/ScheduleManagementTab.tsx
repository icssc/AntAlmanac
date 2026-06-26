import { TAB_INDEX, type TabInfo, type TabName } from '$lib/tabs/tabs';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Tab } from '@mui/material';
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

    return (
        <Tab
            id={tab.id}
            component={Link}
            href={href}
            icon={<tab.icon />}
            iconPosition="top"
            sx={{
                flexDirection: { default: 'column', sm: 'row' },
                minHeight: { default: 'unset', sm: 'auto' },
                minWidth: { default: '25%', sm: '33%' },
                height: { default: 56, sm: 44 },
                padding: { sm: 3 },
                '& .MuiTab-iconWrapper': {
                    marginBottom: { sm: 0 },
                    marginRight: { default: 0, sm: 1 },
                },
                display: tab.mobileOnly ? { default: 'flex', sm: 'none' } : 'flex',
            }}
            label={tab.label}
            onClick={handleClick}
            value={value}
        />
    );
};
