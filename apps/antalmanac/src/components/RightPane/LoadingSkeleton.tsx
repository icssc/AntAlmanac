import { Box, Button, SxProps } from '@mui/material';

const shimmerSx: SxProps = {
    borderRadius: 1,
    background: 'linear-gradient(90deg, #6d6d6d 0%, #7d7d7d 50%, #6d6d6d 100%)',
    backgroundSize: '200% 100%',
    animation: 'addedCoursesShimmer 2s ease-in-out infinite',
    '@keyframes addedCoursesShimmer': {
        '0%': { backgroundPosition: '200% 0' },
        '100%': { backgroundPosition: '-200% 0' },
    },
};

const skeletonButtonSx: SxProps = {
    ...shimmerSx,
    color: 'transparent',
    pointerEvents: 'none',
    boxShadow: 'none',
    '&:hover': { boxShadow: 'none' },
};

const SKELETON_COURSE_COUNT = 3;

export function SectionTableSkeleton() {
    return (
        <Box>
            <Box sx={{ display: 'flex', gap: '4px', mb: 1, mt: 0.5 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    tabIndex={-1}
                    sx={{ ...skeletonButtonSx, width: 220, minWidth: 220 }}
                >
                    &nbsp;
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    tabIndex={-1}
                    sx={{ ...skeletonButtonSx, minWidth: 'fit-content' }}
                >
                    <Box component="span" sx={{ width: 24, height: 24 }} />
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    tabIndex={-1}
                    sx={{ ...skeletonButtonSx, width: 80, minWidth: 80 }}
                >
                    <Box component="span" sx={{ width: 24, height: 24 }} />
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    tabIndex={-1}
                    sx={{ ...skeletonButtonSx, width: 85, minWidth: 85 }}
                >
                    <Box component="span" sx={{ width: 24, height: 24 }} />
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    tabIndex={-1}
                    sx={{ ...skeletonButtonSx, width: 120, minWidth: 120 }}
                >
                    <Box component="span" sx={{ width: 24, height: 24 }} />
                </Button>
            </Box>

            <Box sx={{ ...shimmerSx, width: '100%', height: 60, margin: '8px 0' }} />
        </Box>
    );
}

export function AddedCoursesLoadingSkeleton() {
    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {Array.from({ length: SKELETON_COURSE_COUNT }).map((_, i) => (
                <SectionTableSkeleton key={i} />
            ))}
        </Box>
    );
}
