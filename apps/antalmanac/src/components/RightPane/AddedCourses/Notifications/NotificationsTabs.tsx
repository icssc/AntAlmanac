import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Paper } from '@mui/material';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationsTable } from '$components/RightPane/AddedCourses/Notifications/NotificationsTable';
import { useNotificationStore } from '$stores/NotificationStore';

function groupNotificationsByTerm(notifications: Record<string, unknown>) {
    return Object.keys(notifications).reduce<Record<string, string[]>>((groups, key) => {
        const parts = key.split(' ');
        const term = parts.slice(-2).join(' ');
        if (!groups[term]) {
            groups[term] = [];
        }
        groups[term].push(key);
        return groups;
    }, {});
}

export function NotificationsTabs() {
    const initialized = useNotificationStore(useShallow((store) => store.initialized));
    const notifications = useNotificationStore(useShallow((store) => store.notifications));

    const groups = useMemo(() => groupNotificationsByTerm(notifications), [notifications]);
    const sortedTerms = useMemo(() => Object.keys(groups).sort(), [groups]);

    const [activeTab, setActiveTab] = useState(sortedTerms.at(0));
    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    if (!activeTab) {
        return null;
    }

    if (!initialized) {
        return 'Loading notifications...';
    }

    return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={activeTab}>
                <Paper elevation={0} variant="outlined" square>
                    <TabList onChange={handleTabChange} indicatorColor="primary" variant="fullWidth" centered>
                        {sortedTerms.map((term) => (
                            <Tab label={term} key={term} value={term} />
                        ))}
                    </TabList>
                </Paper>

                {sortedTerms.map((term) => (
                    <TabPanel key={term} value={term} sx={{ paddingX: 0 }}>
                        <NotificationsTable keys={groups[term]} />
                    </TabPanel>
                ))}
            </TabContext>
        </Box>
    );
}
