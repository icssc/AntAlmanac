import { useIsMobile } from '$hooks/useIsMobile';
import { TAB_INDEX, type TabInfo } from '$src/tabs';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Tab } from '@mui/material';
import Link from 'next/link';

interface ScheduleManagementTabProps {
    tab: TabInfo;
    value: number;
    onTabChange: (tabIndex: number) => void;
}

export const ScheduleManagementTab = ({ tab, value, onTabChange }: ScheduleManagementTabProps) => {
    const isMobile = useIsMobile();
    const savedSearch = useSavedSearchStore((store) => store.savedSearch);

    const resolvedHref =
        value === TAB_INDEX.search && savedSearch
            ? savedSearch.startsWith('?')
                ? `/${savedSearch}`
                : `/?${savedSearch}`
            : tab.href || '/';

    const handleClick = () => {
        onTabChange(value);
    };

    return (
        <Tab
            id={tab.id}
            component={Link}
            href={resolvedHref}
            icon={<tab.icon />}
            iconPosition={isMobile ? 'top' : 'start'}
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
            label={tab.label}
            onClick={handleClick}
            value={value}
        />
    );
};
