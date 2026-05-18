import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import { DragIndicator, HistoryEdu, InfoOutlined, Route, Search } from '@mui/icons-material';
import { Box, Button, Skeleton } from '@mui/material';

export interface AddedCourseSkeletonEntry {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    /** Measured total height of the rendered SectionTable, in pixels. */
    height: number;
}

/**
 * Mirrors a `SectionTable` instance during loading. The container is pinned to
 * the measured `entry.height`; the button row renders at its natural height
 * (matched to the real row via children-aware Skeletons), and the body
 * Skeleton stretches to fill the remainder. This makes the skeleton total
 * height exact and the per-button widths exact, leaving no layout shift when
 * the real table renders.
 */
function SectionTableSkeleton({ entry }: { entry: AddedCourseSkeletonEntry }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: entry.height }}>
            <Box sx={{ display: 'flex', gap: '4px', mb: 1, mt: 0.5 }}>
                <Skeleton variant="rounded">
                    <Button variant="contained" color="secondary" sx={{ padding: 0, minWidth: 0, minHeight: 0 }}>
                        <DragIndicator />
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" color="secondary" size="small" startIcon={<InfoOutlined />}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {`${entry.deptCode} ${entry.courseNumber} | ${entry.courseTitle}`}
                        </span>
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small" style={{ minWidth: 'fit-content' }}>
                        <Search />
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small">
                        <span style={{ display: 'flex', gap: 4 }}>
                            <Route />
                            <span>Planner</span>
                        </span>
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small">
                        <span style={{ display: 'flex', gap: 4 }}>
                            <HistoryEdu />
                            <span>Past Syllabi</span>
                        </span>
                    </Button>
                </Skeleton>
            </Box>

            <Skeleton variant="rounded" sx={{ flex: 1, width: '100%' }} />
        </Box>
    );
}

function readBlueprint(): AddedCourseSkeletonEntry[] | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const entries = parsed.flatMap((entry): AddedCourseSkeletonEntry[] => {
                if (typeof entry?.height !== 'number' || entry.height <= 0) return [];
                return [
                    {
                        deptCode: typeof entry.deptCode === 'string' ? entry.deptCode : '',
                        courseNumber: typeof entry.courseNumber === 'string' ? entry.courseNumber : '',
                        courseTitle: typeof entry.courseTitle === 'string' ? entry.courseTitle : '',
                        height: entry.height,
                    },
                ];
            });
            return entries.length > 0 ? entries : null;
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
                <SectionTableSkeleton key={i} entry={entry} />
            ))}
        </Box>
    );
}
