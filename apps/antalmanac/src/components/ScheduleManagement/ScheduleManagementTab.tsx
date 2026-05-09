import { ScheduleManagementTabInfo } from '$components/ScheduleManagement/ScheduleManagementTabs';
import { useIsMobile } from '$hooks/useIsMobile';
import { useTabStore } from '$stores/TabStore';
import { Tab } from '@mui/material';
import NextLink from 'next/link';
import { forwardRef } from 'react';

interface ScheduleManagementTabProps {
    tab: ScheduleManagementTabInfo;
    value: number;
}

const LinkTab = forwardRef<HTMLAnchorElement, { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    function LinkTab({ href, ...props }, ref) {
        return <NextLink ref={ref} href={href} {...props} />;
    }
);

export const ScheduleManagementTab = ({ tab, value }: ScheduleManagementTabProps) => {
    const { setActiveTabValue } = useTabStore();
    const isMobile = useIsMobile();

    const handleClick = () => {
        setActiveTabValue(value);
    };

    return (
        <Tab
            id={tab.id}
            component={LinkTab}
            href={tab.href || '/'}
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
