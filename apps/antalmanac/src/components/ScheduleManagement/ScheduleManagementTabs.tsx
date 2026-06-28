import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
import { useActiveTab } from '$lib/tabs/hooks';
import { TABS, TAB_INDEX, type TabName } from '$lib/tabs/tabs';
import { Tabs as MuiTabs, Paper } from '@mui/material';

interface ScheduleManagementTabsProps {
    onTabChange: (tabName: TabName) => void;
}

export function ScheduleManagementTabs({ onTabChange }: ScheduleManagementTabsProps) {
    const activeTab = useActiveTab();
    const activeTabIndex = TAB_INDEX[activeTab];

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
