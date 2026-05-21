import { ScheduleManagementTabInfo } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { Tab } from '@mui/material';
import { Link } from 'react-router-dom';

// Search is always index 1 in scheduleManagementTabs.
const SEARCH_TAB_VALUE = 1;

interface ScheduleManagementTabProps {
    tab: ScheduleManagementTabInfo;
    value: number;
}

export const ScheduleManagementTab = ({ tab, value }: ScheduleManagementTabProps) => {
    const setActiveTabValue = useTabStore((store) => store.setActiveTabValue);
    const isMobile = useIsMobile();
    const savedSearch = useCoursePaneStore((store) => store.savedSearch);

    // When returning to Search, replay the saved query string so nuqs picks it up.
    const to = value === SEARCH_TAB_VALUE && savedSearch ? { pathname: tab.href, search: savedSearch } : tab.href;

    const handleClick = () => {
        const activeTab = useTabStore.getState().activeTab;

        if (activeTab === SEARCH_TAB_VALUE && value !== SEARCH_TAB_VALUE) {
            useCoursePaneStore.getState().saveSearch();
        }

        if (value === SEARCH_TAB_VALUE) {
            useCoursePaneStore.getState().popSavedSearch();
        }

        setActiveTabValue(value);
    };

    return (
        <Tab
            id={tab.id}
            component={Link}
            to={to}
            icon={tab.icon}
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
