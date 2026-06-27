import { ScheduleManagementTab } from '$components/ScheduleManagement/ScheduleManagementTab';
import { mergeSx } from '$lib/helpers';
import { useActiveTab } from '$lib/tabs/hooks';
import { TAB_INDEX, TABS, type TabName } from '$lib/tabs/tabs';
import { Paper, Tabs as MuiTabs, type SxProps, type Theme } from '@mui/material';

interface ScheduleManagementTabsProps {
    onTabChange: (tabName: TabName) => void;
    sx?: SxProps<Theme>;
}

export function ScheduleManagementTabs({ onTabChange, sx }: ScheduleManagementTabsProps) {
    const activeTab = useActiveTab();
    const activeTabIndex = TAB_INDEX[activeTab];

    return (
        <Paper
            elevation={0}
            variant="outlined"
            square
            sx={mergeSx(
                {
                    borderRadius: '4px 4px 0 0',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    borderWidth: '1px 0px 1px 0px',
                },
                sx
            )}
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
