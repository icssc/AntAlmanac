import { FriendsTab } from '$components/Header/Friends/Friends/FriendsTab';
import { RequestsTab } from '$components/Header/Friends/Requests/RequestsTab';
import type { Friend, FriendRequest } from '$src/backend/lib/rds.types';
import { LIGHT_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';
import { Box, CircularProgress, Dialog, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';

interface FriendsDialogProps {
    open: boolean;
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    friends: Friend[];
    isLoading: boolean;
    onRefresh: () => Promise<void>;
    onClose: () => void;
}

export function FriendsDialog({
    open,
    friendRequests,
    sentRequests,
    friends,
    isLoading,
    onRefresh: loadFriendsData,
    onClose,
}: FriendsDialogProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const tabAccentColor = isDark ? LIGHT_BLUE : 'secondary.main';

    const handleTabChange = (_event: React.SyntheticEvent, value: 'friends' | 'requests') => {
        setActiveTab(value);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <Typography
                component="h2"
                variant="h6"
                sx={{ px: 3, pt: 2.5, pb: 1.5, fontWeight: 500, fontSize: '1.25rem' }}
            >
                Manage Friends
            </Typography>

            <Box sx={{ px: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        minHeight: 48,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            minHeight: 48,
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            color: 'text.secondary',
                        },
                        '& .MuiTab-root.Mui-selected': {
                            color: tabAccentColor,
                        },
                        '& .MuiTabs-indicator': {
                            height: 2,
                            backgroundColor: tabAccentColor,
                        },
                    }}
                >
                    <Tab label="Friends" value="friends" sx={{ textTransform: 'uppercase' }} />
                    <Tab
                        label={friendRequests.length > 0 ? `Requests (${friendRequests.length})` : 'Requests'}
                        value="requests"
                        sx={{ textTransform: 'uppercase' }}
                    />
                </Tabs>
            </Box>

            <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                {isLoading ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <Stack direction="column" spacing={0}>
                        {activeTab === 'friends' && (
                            <FriendsTab friends={friends} onRefresh={loadFriendsData} onClose={onClose} />
                        )}

                        {activeTab === 'requests' && (
                            <RequestsTab
                                friendRequests={friendRequests}
                                sentRequests={sentRequests}
                                onRefresh={loadFriendsData}
                            />
                        )}
                    </Stack>
                )}
            </Box>
        </Dialog>
    );
}
