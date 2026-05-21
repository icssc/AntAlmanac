import { useIsMobile } from '$hooks/useIsMobile';
import { type TabInfo } from '$stores/TabStore';
import { Tab } from '@mui/material';

interface ScheduleManagementTabProps {
    tab: TabInfo;
    value: number;
}

export const ScheduleManagementTab = ({ tab, value }: ScheduleManagementTabProps) => {
    const isMobile = useIsMobile();

    return (
        <Tab
            id={tab.id}
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
            value={value}
        />
    );
};
