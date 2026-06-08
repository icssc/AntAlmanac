import { NotificationsTable } from '$components/RightPane/AddedCourses/Notifications/NotificationsTable';
import { type Notification, useNotificationStore } from '$stores/NotificationStore';
import { NotificationAddOutlined } from '@mui/icons-material';
import { Box, CircularProgress, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

function groupNotificationsByTerm(notifications: Partial<Record<string, Notification>>) {
    return Object.entries(notifications).reduce<Record<string, string[]>>((groups, [key, notification]) => {
        if (!notification) {
            return groups;
        }

        const termName = notification.term.shortName;
        if (!groups[termName]) {
            groups[termName] = [];
        }
        groups[termName].push(key);
        return groups;
    }, {});
}

const getTabId = (term: string) => `notifications-tab-${term}`;
const getTabPanelId = (term: string) => `notifications-tabpanel-${term}`;

export function NotificationsTabs() {
    const theme = useTheme();
    const { initialized, notifications } = useNotificationStore(
        useShallow((store) => ({ initialized: store.initialized, notifications: store.notifications }))
    );

    const groups = useMemo(() => groupNotificationsByTerm(notifications), [notifications]);
    const sortedTerms = useMemo(() => Object.keys(groups).sort(), [groups]);

    const [activeTab, setActiveTab] = useState(() => sortedTerms.at(0));
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
            <Paper
                elevation={0}
                variant="outlined"
                square
                sx={{ bgcolor: theme.palette.background.elevated, borderColor: 'divider' }}
            >
                <Tabs
                    value={displayTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    variant="fullWidth"
                    centered
                    sx={{
                        '& .MuiTab-root': {
                            minHeight: { xs: 40, md: 48 },
                            fontSize: { xs: '0.8125rem', md: '0.9375rem' },
                        },
                    }}
                >
                    {sortedTerms.map((term) => (
                        <Tab
                            label={term}
                            key={term}
                            value={term}
                            id={getTabId(term)}
                            aria-controls={getTabPanelId(term)}
                        />
                    ))}
                </Tabs>
            </Paper>

            {sortedTerms.map((term) =>
                displayTab === term ? (
                    <Box
                        key={term}
                        role="tabpanel"
                        id={getTabPanelId(term)}
                        aria-labelledby={getTabId(term)}
                        sx={{ paddingX: 0 }}
                    >
                        <NotificationsTable keys={groups[term]} />
                    </Box>
                ) : null
            )}
        </Box>
    );
}
