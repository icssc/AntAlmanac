import { NotificationAddOutlined } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Paper, CircularProgress, Typography } from '@mui/material';
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
    const displayTab = activeTab ?? sortedTerms.at(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    if (!initialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (sortedTerms.length === 0) {
        return (
            <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}
            >
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    You don&apos;t have any notifications enabled.
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        mt: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Enable notifications for courses using the
                    </Typography>
                    <NotificationAddOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        icon to get notified about status changes.
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (!displayTab) {
        return null;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={displayTab}>
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
