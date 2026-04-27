import { useIsMobile } from '$hooks/useIsMobile';
import {
    buildCourseId,
    formatTermLabel,
    getSyllabi,
    groupByProfessor,
    groupByTerm,
    isCurrentOffering,
    parseTermShortName,
    pickCurrentTermOfferings,
} from '$lib/syllabi';
import { History, OpenInNew } from '@mui/icons-material';
import {
    Alert,
    Box,
    Chip,
    Divider,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Skeleton,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import type { Syllabus } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';

export interface SyllabiPopupProps {
    deptCode: string;
    courseNumber: string;
    /**
     * The term selected in the course search form ("2025 Fall"). Used to flag
     * the "current quarter" in the UI. Falls back to today's calendar term.
     */
    term?: string;
    /**
     * When opened from the Syllabus column of a particular section, pass that
     * section's instructors so their historical offerings are also elevated.
     */
    highlightInstructors?: string[];
}

type GroupMode = 'quarter' | 'professor';

export function SyllabiPopup({ deptCode, courseNumber, term, highlightInstructors = [] }: SyllabiPopupProps) {
    const isMobile = useIsMobile();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [mode, setMode] = useState<GroupMode>('quarter');

    const currentTerm = useMemo(() => parseTermShortName(term), [term]);
    const courseId = useMemo(() => buildCourseId(deptCode, courseNumber), [deptCode, courseNumber]);
    const highlightSet = useMemo(() => new Set(highlightInstructors), [highlightInstructors]);

    const width = isMobile ? 300 : 440;
    const maxHeight = isMobile ? 360 : 460;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getSyllabi(courseId)
            .then((data) => {
                if (cancelled) return;
                setSyllabi(data);
                setError(null);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                console.error(e);
                setError('Failed to load syllabi.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const currentOfferings = useMemo(() => pickCurrentTermOfferings(syllabi, currentTerm), [syllabi, currentTerm]);

    const hasCurrent = currentOfferings.length > 0;

    const historical = useMemo(
        // Omit the rows we already rendered in the "current" band to avoid duplication.
        () => syllabi.filter((s) => !isCurrentOffering(s, currentTerm)),
        [syllabi, currentTerm]
    );

    const byTerm = useMemo(() => groupByTerm(historical), [historical]);
    const byProfessor = useMemo(() => groupByProfessor(syllabi, currentTerm), [syllabi, currentTerm]);

    const header = (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                paddingX: 1.5,
                paddingTop: 1.25,
                paddingBottom: 0.5,
            }}
        >
            <History fontSize="small" color="primary" />
            <Typography sx={{ fontWeight: 600, flexGrow: 1 }} variant="subtitle1">
                {deptCode} {courseNumber} · Syllabi
            </Typography>
            <ToggleButtonGroup
                size="small"
                exclusive
                value={mode}
                onChange={(_, next: GroupMode | null) => {
                    if (next) setMode(next);
                }}
                aria-label="Group syllabi by"
            >
                <ToggleButton value="quarter" sx={{ textTransform: 'none', paddingY: 0.25 }}>
                    By Quarter
                </ToggleButton>
                <ToggleButton value="professor" sx={{ textTransform: 'none', paddingY: 0.25 }}>
                    By Professor
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{ width, padding: 1.5 }}>
                {header}
                <Skeleton variant="rectangular" height={24} sx={{ marginY: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={64} sx={{ marginBottom: 1, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width, padding: 1.5 }}>
                {header}
                <Alert severity="error" sx={{ marginX: 1.5, marginBottom: 1 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (syllabi.length === 0) {
        return (
            <Box sx={{ width }}>
                {header}
                <Box sx={{ paddingX: 2, paddingY: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No syllabi available yet for this course.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginTop: 0.5 }}>
                        Professors typically upload syllabi close to the start of the quarter.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ width, maxHeight, display: 'flex', flexDirection: 'column' }}>
            {header}
            <Divider />

            <Box sx={{ overflowY: 'auto', paddingBottom: 1 }}>
                {hasCurrent ? (
                    <Box sx={{ paddingX: 1.5, paddingTop: 1 }}>
                        <Alert
                            severity="info"
                            icon={false}
                            sx={{
                                borderRadius: 1,
                                '& .MuiAlert-message': { width: '100%' },
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
                                CURRENT QUARTER · {formatTermLabel(currentTerm.year, currentTerm.quarter)}
                            </Typography>
                            <List dense disablePadding sx={{ marginTop: 0.5 }}>
                                {currentOfferings.map((s) => (
                                    <SyllabusRow key={`current-${s.url}`} syllabus={s} primary />
                                ))}
                            </List>
                        </Alert>
                    </Box>
                ) : null}

                {mode === 'quarter' ? (
                    byTerm.length === 0 ? (
                        !hasCurrent ? (
                            <EmptyBody />
                        ) : null
                    ) : (
                        <List dense disablePadding sx={{ paddingTop: 0.5 }}>
                            {byTerm.map((group) => (
                                <li key={group.label}>
                                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                        <ListSubheader
                                            disableSticky
                                            sx={{
                                                lineHeight: 2,
                                                fontWeight: 600,
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            {group.label}
                                        </ListSubheader>
                                        {group.items.map((s) => (
                                            <SyllabusRow key={`${group.label}-${s.url}`} syllabus={s} />
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </List>
                    )
                ) : (
                    <List dense disablePadding sx={{ paddingTop: 0.5 }}>
                        {byProfessor.map((group) => {
                            const extraHighlight = !group.teachingCurrentTerm && highlightSet.has(group.instructor);
                            return (
                                <li key={group.instructor}>
                                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                        <ListSubheader
                                            disableSticky
                                            sx={{
                                                lineHeight: 2,
                                                backgroundColor: 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                paddingY: 0.25,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {group.instructor}
                                            </Typography>
                                            {group.teachingCurrentTerm ? (
                                                <Chip
                                                    size="small"
                                                    color="primary"
                                                    label="Teaching this quarter"
                                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                                />
                                            ) : extraHighlight ? (
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    label="This section"
                                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                                />
                                            ) : null}
                                        </ListSubheader>
                                        {group.items.map((s) => (
                                            <SyllabusRow
                                                key={`${group.instructor}-${s.url}`}
                                                syllabus={s}
                                                showTerm
                                                hideInstructor={group.instructor}
                                            />
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
}

function EmptyBody() {
    return (
        <Box sx={{ paddingX: 2, paddingY: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                No additional historical syllabi.
            </Typography>
        </Box>
    );
}

interface SyllabusRowProps {
    syllabus: Syllabus;
    /** Prepend the quarter label on the row (used by "By Professor" view). */
    showTerm?: boolean;
    /** When rendering inside a professor group, omit that name from the list. */
    hideInstructor?: string;
    /** Stronger styling for current-quarter rows. */
    primary?: boolean;
}

function SyllabusRow({ syllabus, showTerm, hideInstructor, primary }: SyllabusRowProps) {
    const instructors = hideInstructor
        ? syllabus.instructorNames.filter((n) => n !== hideInstructor)
        : syllabus.instructorNames;

    return (
        <ListItem
            disableGutters
            sx={{
                paddingLeft: 2,
                paddingRight: 1,
                paddingY: 0.25,
            }}
            secondaryAction={
                <Tooltip title="Open syllabus">
                    <IconButton
                        size="small"
                        edge="end"
                        component={Link}
                        href={syllabus.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color={primary ? 'primary' : 'default'}
                        aria-label={`Open syllabus for ${formatTermLabel(syllabus.year, syllabus.quarter)}`}
                    >
                        <OpenInNew fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        >
            <ListItemText
                primary={
                    primary ? (
                        <Link
                            href={syllabus.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ fontWeight: 600 }}
                        >
                            {syllabus.instructorNames.join(', ') || 'Syllabus'}
                        </Link>
                    ) : (
                        <Link
                            href={syllabus.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            color="inherit"
                        >
                            {showTerm
                                ? formatTermLabel(syllabus.year, syllabus.quarter)
                                : syllabus.instructorNames.join(', ') || 'Syllabus'}
                        </Link>
                    )
                }
                secondary={primary ? null : showTerm ? (instructors.length ? instructors.join(', ') : null) : null}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary', noWrap: true }}
                sx={{ marginY: 0, paddingRight: 4 }}
            />
        </ListItem>
    );
}
