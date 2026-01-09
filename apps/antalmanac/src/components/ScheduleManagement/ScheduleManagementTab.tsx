import { Tab, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

import { ScheduleManagementTabInfo } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsSharedSchedulePage } from '$src/hooks/useIsSharedSchedulePage';
import { useTabStore } from '$stores/TabStore';

interface ScheduleManagementTabProps {
    tab: ScheduleManagementTabInfo;
    value: number;
}

export const ScheduleManagementTab = ({ tab, value }: ScheduleManagementTabProps) => {
    const { setActiveTabValue } = useTabStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSharedSchedulePage = useIsSharedSchedulePage();
    const isSearchTab = value === 1; // Search tab is at index 1

    const handleClick = (e: React.MouseEvent) => {
        if (isSharedSchedulePage && isSearchTab) {
            e.preventDefault();
            return;
        }
        setActiveTabValue(value);
        if (isSharedSchedulePage) {
            e.preventDefault();
        }
    };

    if (isSharedSchedulePage) {
        const tabComponent = (
            <Tab
                id={tab.id}
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
                disabled={isSearchTab}
            />
        );

        if (isSearchTab) {
            return (
                <Tooltip title="Add this schedule to your account before adding classes">
                    <span
                        style={{
                            display: 'flex',
                            flex: 1,
                            alignItems: 'stretch',
                            ...(isMobile
                                ? {
                                      minWidth: '25%',
                                  }
                                : {
                                      minWidth: '33%',
                                  }),
                        }}
                    >
                        <span style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {tabComponent}
                        </span>
                    </span>
                </Tooltip>
            );
        }

        return tabComponent;
    }

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
            }}
            label={tab.label}
            onClick={handleClick}
            value={value}
        />
    );
};
