import { Tab, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

import { ScheduleManagementTabInfo } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useThemeStore } from '$stores/SettingsStore';

interface ScheduleManagementTabProps {
    tab: ScheduleManagementTabInfo;
}

export function ScheduleManagementTab({ tab }: ScheduleManagementTabProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Tab
            key={tab.label}
            id={tab.id}
            component={Link}
            to={tab.href}
            icon={tab.icon}
            iconPosition={isMobile ? 'top' : 'start'}
            sx={{
                ...(!isMobile
                    ? {
                          minHeight: 'auto',
                          height: '44px',
                          padding: 3,
                          minWidth: '33%',
                      }
                    : {}),
                display: !isMobile && tab.mobile ? 'none' : 'flex',
                ...(isDark ? { '&.Mui-selected': { color: 'white' } } : {}),
            }}
            label={tab.label}
        />
    );
}
