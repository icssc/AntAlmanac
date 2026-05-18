import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import { DragIndicator, HistoryEdu, InfoOutlined, Route, Search } from '@mui/icons-material';
import { Box, Button, Skeleton } from '@mui/material';

export interface AddedCourseSkeletonEntry {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    sectionCount: number;
}

const SECTION_ROW_HEIGHT = 33;
const TABLE_HEADER_HEIGHT = 33;

/**
 * Mirrors the button row of `SectionTable` so MUI's children-aware Skeleton
 * sizes each placeholder to the exact width the real button will occupy. The
 * children render with `visibility: hidden`, contributing layout only.
 */
function SectionTableSkeleton({ entry }: { entry: AddedCourseSkeletonEntry }) {
    const tableHeight = entry.sectionCount * SECTION_ROW_HEIGHT + TABLE_HEADER_HEIGHT;

    return (
        <Box>
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
            return parsed.map((entry) => ({
                deptCode: typeof entry?.deptCode === 'string' ? entry.deptCode : '',
                courseNumber: typeof entry?.courseNumber === 'string' ? entry.courseNumber : '',
                courseTitle: typeof entry?.courseTitle === 'string' ? entry.courseTitle : '',
                sectionCount: typeof entry?.sectionCount === 'number' ? entry.sectionCount : 1,
            }));
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
