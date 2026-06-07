import { Box, Skeleton, Stack } from '@mui/material';

export default function Loading() {
    return (
        <Stack component="main" height="calc(100svh + env(safe-area-inset-top))" spacing={1} padding={1}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
                <Skeleton variant="rectangular" sx={{ flex: '0 0 42.5%', borderRadius: 1, minHeight: 400 }} />
                <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1, minHeight: 400 }} />
            </Box>
        </Stack>
    );
}
