import { Box, SxProps } from '@mui/material';

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

const SKELETON_COURSE_COUNT = 3;

export function SectionTableSkeleton() {
    return (
        <Box>
            <Box sx={{ display: 'flex', gap: '4px', mb: 1, mt: 0.5 }}>
                <Box sx={{ ...shimmerSx, width: 220, height: 32 }} />
                <Box sx={{ ...shimmerSx, width: 80, height: 32 }} />
                <Box sx={{ ...shimmerSx, width: 85, height: 32 }} />
                <Box sx={{ ...shimmerSx, width: 120, height: 32 }} />
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
