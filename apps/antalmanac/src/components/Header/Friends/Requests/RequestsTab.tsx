import { RequestCard } from '$components/Header/Friends/Requests/RequestCard';
import { RequestSearch } from '$components/Header/Friends/Requests/RequestSearch';
import { SentRequestCard } from '$components/Header/Friends/Requests/SentRequestCard';
import type { FriendRequest } from '$src/backend/lib/rds.types';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';

interface RequestsTabProps {
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    onRefresh: () => Promise<void>;
}

export function RequestsTab({ friendRequests, sentRequests, onRefresh }: RequestsTabProps) {
    const [subTab, setSubTab] = useState<'received' | 'sent'>('received');

    const handleSubTabChange = (_event: MouseEvent<HTMLElement>, value: 'received' | 'sent' | null) => {
        if (!value) {
            return;
        }

        setSubTab(value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <RequestSearch onRefresh={onRefresh} />

            <ToggleButtonGroup
                fullWidth
                size="small"
                color="secondary"
                value={subTab}
                exclusive
                aria-label="Friend request selection"
                onChange={handleSubTabChange}
            >
                <ToggleButton value="received">Received</ToggleButton>
                <ToggleButton value="sent">Sent</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {subTab === 'received' && (
                    <>
                        {friendRequests.length === 0 ? (
                            <Typography variant="body1" color="text.secondary">
                                No pending requests
                            </Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <RequestCard key={request.id} request={request} onRefresh={onRefresh} />
                            ))
                        )}
                    </>
                )}

                {subTab === 'sent' && (
                    <>
                        {sentRequests.length === 0 ? (
                            <Typography variant="body1" color="text.secondary">
                                No sent requests
                            </Typography>
                        ) : (
                            sentRequests.map((request) => (
                                <SentRequestCard key={request.id} request={request} onRefresh={onRefresh} />
                            ))
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}
