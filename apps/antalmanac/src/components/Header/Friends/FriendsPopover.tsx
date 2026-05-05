import { FriendsTab } from '$components/Header/Friends/Friends/FriendsTab';
import { RequestsTab } from '$components/Header/Friends/Requests/RequestsTab';
import type { Friend, FriendRequest } from '$src/backend/lib/rds.types';
import { Box, Card, CardContent, CardHeader, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';

interface FriendsPopoverProps {
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    friends: Friend[];
    isLoading: boolean;
    onRefresh: () => Promise<void>;
}

export function FriendsPopover({
    friendRequests,
    sentRequests,
    friends,
    isLoading,
    onRefresh: loadFriendsData,
}: FriendsPopoverProps) {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

    const handleTabChange = (_event: React.MouseEvent<HTMLElement>, value: 'friends' | 'requests' | null) => {
        if (!value) {
            return;
        }

        setActiveTab(value);
    };

    return (
        <>
            <Card>
                <CardHeader
                    title="Manage Friends"
                    slotProps={{
                        title: { sx: { fontWeight: 500 }, variant: 'h6' },
                    }}
                />

                <CardContent sx={{ width: 500, paddingTop: 0 }}>
                    {isLoading ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={20} />
                        </Box>
                    ) : (
                        <>
                            <ToggleButtonGroup
                                fullWidth
                                size="medium"
                                color="secondary"
                                value={activeTab}
                                exclusive
                                aria-label="Friends selection"
                                onChange={handleTabChange}
                            >
                                <ToggleButton value="friends">Friends</ToggleButton>
                                <ToggleButton value="requests">
                                    {friendRequests.length > 0 ? `Requests (${friendRequests.length})` : 'Requests'}
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {activeTab === 'friends' && <FriendsTab friends={friends} onRefresh={loadFriendsData} />}

                            {activeTab === 'requests' && (
                                <RequestsTab
                                    friendRequests={friendRequests}
                                    sentRequests={sentRequests}
                                    onRefresh={loadFriendsData}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
