import { Tab, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

import { ScheduleManagementTabInfo } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

interface ScheduleManagementTabProps {
    tab: ScheduleManagementTabInfo;
    value: number;
}

export const ScheduleManagementTab = ({ tab, value }: ScheduleManagementTabProps) => {
    const { setActiveTabValue } = useTabStore();
    const isDark = useThemeStore((store) => store.isDark);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClick = () => {
        setActiveTabValue(value);
    };

    return (
        <Tab
            id={tab.id}
            component={Link}
            to={tab.href}
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
                ...(isDark ? { '&.Mui-selected': { color: 'white' } } : {}),
            }}
            label={tab.label}
            onClick={handleClick}
            value={value}
        />
    );
};
