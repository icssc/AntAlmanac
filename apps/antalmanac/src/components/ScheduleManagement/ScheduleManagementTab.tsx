import { useIsMobile } from '$hooks/useIsMobile';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { TAB_INDEX, type TabInfo } from '$stores/TabStore';
import { Tab } from '@mui/material';
import { Link } from 'react-router-dom';

interface ScheduleManagementTabProps {
    tab: TabInfo;
    value: number;
    onTabChange: (tabIndex: number) => void;
}

export const ScheduleManagementTab = ({ tab, value, onTabChange }: ScheduleManagementTabProps) => {
    const isMobile = useIsMobile();
    const savedSearch = useSavedSearchStore((store) => store.savedSearch);

    const to =
        value === TAB_INDEX.search && savedSearch
            ? { pathname: tab.href || '/', search: savedSearch }
            : tab.href || '/';

    const handleClick = () => {
        onTabChange(value);
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
                display: isMobile || !tab.mobile ? 'flex' : 'none',
            }}
            label={tab.label}
            onClick={handleClick}
            value={value}
        />
    );
};
