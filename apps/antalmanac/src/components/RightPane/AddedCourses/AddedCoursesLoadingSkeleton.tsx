import { useIsMobile } from '$hooks/useIsMobile';
import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { DragIndicator, ExpandLess, HistoryEdu, InfoOutlined, Route, Search } from '@mui/icons-material';
import { Box, Button, IconButton, Skeleton, useTheme } from '@mui/material';

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
 * Skeleton stretches to fill the remainder. This keeps the skeleton total
 * height exact and the per-button widths exact, so no layout shift when the
 * real table renders.
 *
 * The hidden Button children below must mirror what `SectionTable` renders —
 * including conditional bits like `CourseInfoBar`'s isMobile startIcon and
 * `CourseInfoButton`'s compact mode — because MUI sizes each Skeleton to the
 * (visibility: hidden) child it wraps.
 */
function SectionTableSkeleton({ entry }: { entry: AddedCourseSkeletonEntry }) {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const scheduleManagementWidth = useScheduleManagementStore((state) => state.scheduleManagementWidth);
    const compact =
        isMobile || (scheduleManagementWidth !== null && scheduleManagementWidth < theme.breakpoints.values.xs);

    const renderButtonInfoText = (text: string, icon: React.ReactElement) => (
        <span style={{ display: 'flex', gap: 4 }}>
            {icon}
            {compact ? null : (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
            )}
        </span>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: entry.height, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', gap: '4px', mb: 1, mt: 0.5 }}>
                <Skeleton variant="rounded">
                    <Button variant="contained" color="secondary" sx={{ padding: 0, minWidth: 0, minHeight: 0 }}>
                        <DragIndicator />
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={!isMobile && <InfoOutlined />}
                    >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {`${entry.deptCode} ${entry.courseNumber} | ${entry.courseTitle}`}
                        </span>
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small" color="primary" style={{ minWidth: 'fit-content' }}>
                        <Search />
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small" color="primary">
                        {renderButtonInfoText('Planner', <Route />)}
                    </Button>
                </Skeleton>

                <Skeleton variant="rounded">
                    <Button variant="contained" size="small" color="primary">
                        {renderButtonInfoText('Past Syllabi', <HistoryEdu />)}
                    </Button>
                </Skeleton>

                <Skeleton variant="circular" sx={{ ml: 'auto', mr: 0.5 }}>
                    <IconButton size="small" sx={{ padding: '4px' }}>
                        <ExpandLess />
                    </IconButton>
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
