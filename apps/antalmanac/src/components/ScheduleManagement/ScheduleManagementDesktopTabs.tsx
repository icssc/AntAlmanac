import { Stack, Typography } from '@mui/material';

import {
    ScheduleManagementTabInfo,
    ScheduleManagementTabs,
} from '$components/ScheduleManagement/ScheduleManagementTabs';

export function ScheduleManagementDesktopTabs() {
    const TabLabel = ({ tab }: { tab: ScheduleManagementTabInfo }) => {
        return (
            <Stack style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <tab.icon style={{ height: 16 }} />
                <Typography variant="body2">{tab.label}</Typography>
            </Stack>
        );
    };

    return (
        <ScheduleManagementTabs
            sx={{
                minHeight: 'auto',
                height: '44px',
                padding: 3,
                minWidth: '33%',
            }}
            label={(tab: ScheduleManagementTabInfo) => <TabLabel tab={tab} />}
        />
    );
}
