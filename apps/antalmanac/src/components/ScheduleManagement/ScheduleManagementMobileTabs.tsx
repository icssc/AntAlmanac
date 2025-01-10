import { Stack, Typography } from '@mui/material';

import {
    ScheduleManagementTabInfo,
    ScheduleManagementTabs,
} from '$components/ScheduleManagement/ScheduleManagementTabs';

export function ScheduleManagementMobileTabs() {
    const TabLabel = ({ tab }: { tab: ScheduleManagementTabInfo }) => {
        return (
            <Stack direction="column" alignItems="center" paddingBottom={1} gap={0.25}>
                <tab.icon sx={{ fontSize: 20 }} />
                <Typography textTransform="none" sx={{ fontSize: 9 }}>
                    {tab.label}
                </Typography>
            </Stack>
        );
    };

    return <ScheduleManagementTabs label={(tab: ScheduleManagementTabInfo) => <TabLabel tab={tab} />} />;
}
