import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
import { TABS, useTabStore } from '$stores/TabStore';
import { Tabs as MuiTabs, Paper } from '@mui/material';

interface ScheduleManagementTabsProps {
    onTabChange: (tabIndex: number) => void;
}

export function ScheduleManagementTabs({ onTabChange }: ScheduleManagementTabsProps) {
    const activeTab = useTabStore((store) => store.activeTab);

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
            <MuiTabs value={activeTab} indicatorColor="secondary" textColor="secondary" variant="fullWidth" centered>
                {TABS.map((tab, index) => (
                    <ScheduleManagementTab key={tab.name} tab={tab} value={index} onTabChange={onTabChange} />
                ))}
            </MuiTabs>
        </Paper>
    );
}
