import { PersonAdd } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { BlockedUserCard } from './BlockedUserCard';
import { RequestCard } from './RequestCard';
import { SentRequestCard } from './SentRequestCard';
import { textFieldSx } from './styles';
import type { Friend, FriendRequest } from './types';

interface RequestsTabProps {
    email: string;
    onEmailChange: (v: string) => void;
    onAddFriend: () => void;
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    blockedFriends: Friend[];
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onCancelRequest: (id: string) => void;
    onOpenBlockMenu: (e: React.MouseEvent<HTMLElement>, id: string) => void;
    onUnblock: (id: string) => void;
}

export function RequestsTab({
    email,
    onEmailChange,
    onAddFriend,
    friendRequests,
    sentRequests,
    blockedFriends,
    onAccept,
    onDecline,
    onCancelRequest,
    onOpenBlockMenu,
    onUnblock,
}: RequestsTabProps) {
    const [subTab, setSubTab] = useState<'received' | 'sent' | 'blocked'>('received');

    return (
        <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <TextField
                    variant="standard"
                    size="small"
                    placeholder="Add friend by name or email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (email.trim()) onAddFriend();
                        }
                    }}
                    fullWidth
                    sx={textFieldSx}
                />
                <IconButton
                    onClick={onAddFriend}
                    disabled={!email.trim()}
                    color="primary"
                    size="small"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 0.75,
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                    }}
                >
                    <PersonAdd fontSize="small" />
                </IconButton>
            </Stack>

            <Stack direction="row" sx={{ mt: 1.5 }} gap={1}>
                {(
                    [
                        { value: 'received', label: 'Received' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'blocked', label: 'Blocked' },
                    ] as const
                ).map(({ value, label }) => (
                    <Button
                        key={value}
                        size="small"
                        onClick={() => setSubTab(value)}
                        sx={{
                            minWidth: 0,
                            px: 1,
                            borderRadius: 999,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            py: 0.4,
                            bgcolor: subTab === value ? '#0000003B' : 'transparent',
                            color: subTab === value ? 'text.primary' : 'text.secondary',
                            '&:hover': { bgcolor: subTab === value ? '#00000055' : 'action.hover' },
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </Stack>

            <Box
                sx={{
                    mt: 1,
                    maxHeight: 260,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { background: 'none' },
                    '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'action.disabled' },
                }}
            >
                {subTab === 'received' && (
                    <>
                        {friendRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5 }}>
                                No pending requests
                            </Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onAccept={onAccept}
                                    onDecline={onDecline}
                                    onOpenBlockMenu={onOpenBlockMenu}
                                />
                            ))
                        )}
                    </>
                )}

                {subTab === 'sent' && (
                    <>
                        {sentRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5 }}>
                                No sent requests
                            </Typography>
                        ) : (
                            sentRequests.map((request) => (
                                <SentRequestCard key={request.id} request={request} onCancel={onCancelRequest} />
                            ))
                        )}
                    </>
                )}

                {subTab === 'blocked' && (
                    <>
                        {blockedFriends.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5 }}>
                                No blocked users
                            </Typography>
                        ) : (
                            blockedFriends.map((user) => (
                                <BlockedUserCard key={user.id} user={user} onUnblock={onUnblock} />
                            ))
                        )}
                    </>
                )}
            </Box>
        </>
    );
}
