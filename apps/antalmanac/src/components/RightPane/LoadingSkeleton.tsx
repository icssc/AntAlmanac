import { Box, Button, SxProps } from '@mui/material';

import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';

export interface AddedCourseSkeletonEntry {
    sectionCount: number;
}

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

const SECTION_ROW_HEIGHT = 33;
const TABLE_HEADER_HEIGHT = 33;
const DEFAULT_SECTION_COUNT = 2;
const DEFAULT_COURSE_COUNT = 3;

function getTableHeight(sectionCount: number) {
    return TABLE_HEADER_HEIGHT + sectionCount * SECTION_ROW_HEIGHT;
}

export function SectionTableSkeleton({ sectionCount = DEFAULT_SECTION_COUNT }: { sectionCount?: number }) {
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

            <Box sx={{ ...shimmerSx, width: '100%', height: getTableHeight(sectionCount), margin: '8px 0' }} />
        </Box>
    );
}

function getBlueprint(): AddedCourseSkeletonEntry[] | null {
    try {
        const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch {
        // ignore malformed data
    }
    return null;
}

export function AddedCoursesLoadingSkeleton() {
    const blueprint = getBlueprint();

    if (blueprint) {
        return (
            <Box display="flex" flexDirection="column" gap={1}>
                {blueprint.map((entry, i) => (
                    <SectionTableSkeleton key={i} sectionCount={entry.sectionCount} />
                ))}
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {Array.from({ length: DEFAULT_COURSE_COUNT }).map((_, i) => (
                <SectionTableSkeleton key={i} />
            ))}
        </Box>
    );
}
