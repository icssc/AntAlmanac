import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import { Box, Skeleton } from '@mui/material';

export interface AddedCourseSkeletonEntry {
    sectionCount: number;
}

const BUTTON_ROW_HEIGHT = 30;
const SECTION_ROW_HEIGHT = 33;
const TABLE_HEADER_HEIGHT = 33;

function SectionTableSkeleton({ sectionCount }: { sectionCount: number }) {
    const tableHeight = sectionCount * SECTION_ROW_HEIGHT + TABLE_HEADER_HEIGHT;

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: '4px', mb: 1, mt: 0.5 }}>
                <Skeleton variant="rounded" width={220} height={BUTTON_ROW_HEIGHT} />
                <Skeleton variant="rounded" width={40} height={BUTTON_ROW_HEIGHT} />
                <Skeleton variant="rounded" width={85} height={BUTTON_ROW_HEIGHT} />
                <Skeleton variant="rounded" width={110} height={BUTTON_ROW_HEIGHT} />
            </Box>
            <Skeleton variant="rounded" width="100%" height={tableHeight} sx={{ mb: 1 }} />
        </Box>
    );
}

function readBlueprint(): AddedCourseSkeletonEntry[] | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
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
    const blueprint = readBlueprint();

    if (!blueprint) return null;

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {blueprint.map((entry, i) => (
                <SectionTableSkeleton key={i} sectionCount={entry.sectionCount} />
            ))}
        </Box>
    );
}
