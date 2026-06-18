import { useIsMobile } from '$hooks/useIsMobile';
import { type TabInfo, type TabName } from '$lib/tabs/tabs';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Tab } from '@mui/material';
import { Link } from 'react-router-dom';

interface ScheduleManagementTabProps {
    tab: TabInfo;
    onTabChange: (tabName: TabName) => void;
}

export const ScheduleManagementTab = ({ tab, onTabChange }: ScheduleManagementTabProps) => {
    const isMobile = useIsMobile();
    const savedSearch = useSavedSearchStore((store) => store.savedSearch);

    const to =
        tab.name === 'search' && savedSearch ? { pathname: tab.href || '/', search: savedSearch } : tab.href || '/';

    const handleClick = () => {
        onTabChange(tab.name);
    };

    return (
        <Tab
            id={tab.id}
            component={Link}
            to={to}
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
            value={tab.name}
        />
    );
};
