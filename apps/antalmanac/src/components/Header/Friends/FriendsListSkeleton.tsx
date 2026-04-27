import { Box, Divider, Skeleton, Stack, Tab, Tabs } from '@mui/material';

export function FriendsListSkeleton() {
    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Tabs value="friends" variant="fullWidth" sx={{ mb: 1 }}>
                <Tab label="Requests" value="requests" disabled />
                <Tab label="Friends" value="friends" disabled />
            </Tabs>
            <Box sx={{ mt: 1 }}>
                {[1, 2, 3].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack direction="row" alignItems="center" flex={1} spacing={1}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Skeleton variant="text" width="70%" height={20} />
                                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Skeleton variant="rounded" width={100} height={32} />
                            <Skeleton variant="circular" width={32} height={32} sx={{ ml: 0.5 }} />
                        </Stack>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
