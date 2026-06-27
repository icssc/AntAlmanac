import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
import { useActiveTab } from '$lib/tabs/hooks';
import { TAB_INDEX, TABS, type TabName } from '$lib/tabs/tabs';
import { Paper, Tabs as MuiTabs, useMediaQuery, useTheme } from '@mui/material';
import { useSelectedLayoutSegment } from 'next/navigation';

interface ScheduleManagementTabsProps {
    onTabChange: (tabName: TabName) => void;
}

export function ScheduleManagementTabs({ onTabChange }: ScheduleManagementTabsProps) {
    const theme = useTheme();
    const segment = useSelectedLayoutSegment();
    const activeTab = useActiveTab();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { defaultMatches: false });

    // /calendar on desktop: highlight search (calendar tab is hidden). Content uses responsive CSS, not redirect.
    const activeTabIndex =
        segment === 'calendar' ? (isMobile ? TAB_INDEX.calendar : TAB_INDEX.search) : TAB_INDEX[activeTab];

    return (
        <Paper
            elevation={0}
            variant="outlined"
            square
            sx={{
                borderRadius: '4px 4px 0 0',
                paddingBottom: 'env(safe-area-inset-bottom)',
                borderWidth: '1px 0px 1px 0px',
            }}
        >
            <MuiTabs
                value={activeTabIndex}
                indicatorColor="secondary"
                textColor="secondary"
                variant="fullWidth"
                centered
            >
                {TABS.map((tab, index) => (
                    <ScheduleManagementTab key={tab.name} tab={tab} value={index} onTabChange={onTabChange} />
                ))}
            </MuiTabs>
        </Paper>
    );
}
