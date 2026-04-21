import trpc from '$lib/api/trpc';
import {
    MAX_QUERIES,
    useGradeExplorerStore,
    type ExplorerPresetAction,
    type GradeQuery,
} from '$stores/GradeExplorerStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { AutoAwesome } from '@mui/icons-material';
import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import type { RawGrades, RawGradeSection } from '@packages/antalmanac-types';
import { useCallback, useState } from 'react';

/**
 * Rank a list of raw rows by a grouping key, returning the top N keys
 * by total letter-grade students (so the "most-taught" instructors or
 * courses rise to the top).
 */
function topKeysByLetterCount<T extends RawGradeSection, K extends string>(
    rows: T[],
    keyFn: (row: T) => K | null,
    n: number
): K[] {
    const totals = new Map<K, number>();
    for (const row of rows) {
        const key = keyFn(row);
        if (!key) continue;
        const letters = row.gradeACount + row.gradeBCount + row.gradeCCount + row.gradeDCount + row.gradeFCount;
        totals.set(key, (totals.get(key) ?? 0) + letters);
    }
    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key]) => key);
}

interface PresetOption {
    action: ExplorerPresetAction;
    label: string;
    description: string;
    /** Disables the item with a tooltip-ish description when false. */
    enabled: (active: GradeQuery | undefined) => boolean;
}

const PRESET_OPTIONS: PresetOption[] = [
    {
        action: 'allInstructorsForCourse',
        label: 'All instructors for this course',
        description: 'Expands to the top instructors teaching the active dept + course.',
        enabled: (q) => Boolean(q?.department && q?.courseNumber),
    },
    {
        action: 'instructorAcrossCourses',
        label: 'This instructor across courses',
        description: 'Shows top courses taught by the active instructor.',
        enabled: (q) => Boolean(q?.instructor),
    },
    {
        action: 'yearOverYear',
        label: 'Year-over-year',
        description: 'Switches to Trend to plot GPA per year for the current queries.',
        enabled: (q) => Boolean(q?.department || q?.instructor),
    },
    {
        action: 'instructorVsDept',
        label: 'Instructor vs department baseline',
        description: 'Compares the active instructor against the dept-wide baseline.',
        enabled: (q) => Boolean(q?.department && q?.courseNumber && q?.instructor),
    },
];

export function PresetsMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [running, setRunning] = useState(false);

    const queries = useGradeExplorerStore((s) => s.queries);
    const activeQueryId = useGradeExplorerStore((s) => s.activeQueryId);
    const replaceQueries = useGradeExplorerStore((s) => s.replaceQueries);
    const setActiveTab = useGradeExplorerStore((s) => s.setActiveTab);

    const activeQuery = queries.find((q) => q.id === activeQueryId);

    const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
    const handleClose = useCallback(() => setAnchorEl(null), []);

    const runPreset = useCallback(
        async (action: ExplorerPresetAction) => {
            if (!activeQuery) return;
            setRunning(true);
            try {
                if (action === 'allInstructorsForCourse') {
                    if (!activeQuery.department || !activeQuery.courseNumber) return;
                    const rows: RawGrades = await trpc.grades.rawGrades.mutate({
                        department: activeQuery.department,
                        courseNumber: activeQuery.courseNumber,
                    });
                    const instructors = topKeysByLetterCount(rows, (row) => row.instructors[0] ?? null, MAX_QUERIES);
                    if (!instructors.length) {
                        openSnackbar('warning', 'No instructor data found for that course.');
                        return;
                    }
                    replaceQueries(
                        instructors.map((instructor) => ({
                            department: activeQuery.department,
                            courseNumber: activeQuery.courseNumber,
                            instructor,
                            division: activeQuery.division,
                        })),
                        'distribution'
                    );
                } else if (action === 'instructorAcrossCourses') {
                    if (!activeQuery.instructor) return;
                    const rows: RawGrades = await trpc.grades.rawGrades.mutate({
                        instructor: activeQuery.instructor,
                    });
                    const courses = topKeysByLetterCount(
                        rows,
                        (row) => (row.department ? `${row.department}|${row.courseNumber}` : null),
                        MAX_QUERIES
                    );
                    if (!courses.length) {
                        openSnackbar('warning', 'No course data found for that instructor.');
                        return;
                    }
                    replaceQueries(
                        courses.map((key) => {
                            const [department, courseNumber] = key.split('|');
                            return {
                                department,
                                courseNumber,
                                instructor: activeQuery.instructor,
                            };
                        }),
                        'distribution'
                    );
                } else if (action === 'yearOverYear') {
                    setActiveTab('trend');
                } else if (action === 'instructorVsDept') {
                    setActiveTab('benchmark');
                }
            } catch (err) {
                openSnackbar('error', err instanceof Error ? err.message : 'Preset failed. Try again in a moment.');
            } finally {
                setRunning(false);
                setAnchorEl(null);
            }
        },
        [activeQuery, replaceQueries, setActiveTab]
    );

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                startIcon={<AutoAwesome fontSize="small" />}
                onClick={handleOpen}
                disabled={running}
            >
                Presets
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { maxWidth: 320 } } }}
            >
                {PRESET_OPTIONS.map((option) => {
                    const enabled = option.enabled(activeQuery);
                    return (
                        <MenuItem
                            key={option.action}
                            onClick={() => void runPreset(option.action)}
                            disabled={!enabled || running}
                        >
                            <ListItemText
                                primary={option.label}
                                secondary={option.description}
                                slotProps={{
                                    secondary: { sx: { fontSize: '0.72rem', lineHeight: 1.2 } },
                                }}
                            />
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
