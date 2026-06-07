import {
    useCourseSearchForm,
    useCourseSearchParam,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { ArrowDropDown } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Grow, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import type { AATerm, Roadmap } from '@packages/antalmanac-types';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

// TODO: Remove mock data before merging. Hardcoded roadmaps for testing the pill UI.
const MOCK_ROADMAPS: Roadmap[] = [
    {
        id: 'mock-1',
        name: 'CS Major Roadmap',
        content: [2024, 2025, 2026].flatMap((startYear) => ({
            name: `${startYear}-${startYear + 1}`,
            startYear,
            quarters: ['Fall', 'Winter', 'Spring'].map((q) => ({
                name: q,
                courses: [{ courseId: 'COMPSCI161' }, { courseId: 'COMPSCI162' }, { courseId: 'COMPSCI171' }],
            })),
        })),
    },
    {
        id: 'mock-2',
        name: 'GE Roadmap',
        content: [2024, 2025, 2026].flatMap((startYear) => ({
            name: `${startYear}-${startYear + 1}`,
            startYear,
            quarters: ['Fall', 'Winter', 'Spring'].map((q) => ({
                name: q,
                courses: [{ courseId: 'WRITING39B' }, { courseId: 'HUMANIT1AS' }],
            })),
        })),
    },
];

function getRoadmapCourseIds(roadmap: Roadmap, term: AATerm): string[] | null {
    const quarterPlan = getQuarterPlan(roadmap, term);
    if (!quarterPlan) return null;
    return quarterPlan.courses.filter((c) => !c.courseId.startsWith('CUSTOM#')).map((c) => c.courseId);
}

export function RoadmapPill() {
    const [term] = useCourseSearchParam('term');
    const { setField } = useCourseSearchForm();
    const { showResults } = useCourseSearchView();

    // TODO: Restore sessionIsValid gate before merging.
    const _sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const { plannerRoadmaps: _realRoadmaps, isPlannerLoading } = usePlannerStore(
        useShallow((s) => ({ plannerRoadmaps: s.plannerRoadmaps, isPlannerLoading: s.isPlannerLoading }))
    );

    // TODO: Remove mock override before merging.
    const plannerRoadmaps = MOCK_ROADMAPS.length > 0 ? MOCK_ROADMAPS : _realRoadmaps;

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const roadmapsForTerm = useMemo(() => {
        return plannerRoadmaps.filter((r) => getRoadmapTermRelation(r, term) === RoadmapTermRelation.IncludesTerm);
    }, [plannerRoadmaps, term]);

    const activeRoadmap = useMemo(() => {
        if (selectedId) {
            return roadmapsForTerm.find((r) => r.id.toString() === selectedId) ?? roadmapsForTerm[0] ?? null;
        }
        return roadmapsForTerm[0] ?? null;
    }, [roadmapsForTerm, selectedId]);

    const handleSearch = useCallback(() => {
        if (!activeRoadmap) return;
        const ids = getRoadmapCourseIds(activeRoadmap, term);
        if (!ids || ids.length === 0) {
            openSnackbar('error', `No courses found in "${activeRoadmap.name}" for ${term.shortName}`);
            return;
        }
        setField('courseIds', ids);
        showResults();
    }, [activeRoadmap, setField, showResults, term]);

    const handleSelect = useCallback(
        (roadmap: Roadmap) => {
            setSelectedId(roadmap.id.toString());
            setMenuOpen(false);

            const ids = getRoadmapCourseIds(roadmap, term);
            if (!ids || ids.length === 0) {
                openSnackbar('error', `No courses found in "${roadmap.name}" for ${term.shortName}`);
                return;
            }
            setField('courseIds', ids);
            showResults();
        },
        [setField, showResults, term]
    );

    // TODO: Restore `_sessionIsValid &&` gate before merging.
    const visible = !isPlannerLoading && roadmapsForTerm.length > 0;

    return (
        <Grow in={visible} mountOnEnter unmountOnExit>
            <Box>
                <ButtonGroup
                    ref={anchorRef}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', maxWidth: '100%' }}
                >
                    <Tooltip title={`Search courses from "${activeRoadmap?.name}" for ${term.shortName}`}>
                        <Button
                            onClick={handleSearch}
                            sx={{
                                textTransform: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 200,
                            }}
                        >
                            {activeRoadmap?.name ?? 'Roadmap'}
                        </Button>
                    </Tooltip>
                    <Button
                        size="small"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Select a different roadmap"
                        sx={{ px: 0.5, minWidth: 'unset' }}
                    >
                        <ArrowDropDown fontSize="small" />
                    </Button>
                </ButtonGroup>

                <Menu
                    anchorEl={anchorRef.current}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    slotProps={{ paper: { sx: { maxWidth: 280, maxHeight: 300 } } }}
                >
                    {plannerRoadmaps.map((roadmap) => {
                        const relation = getRoadmapTermRelation(roadmap, term);
                        const hasCourses = relation === RoadmapTermRelation.IncludesTerm;
                        return (
                            <MenuItem
                                key={roadmap.id.toString()}
                                selected={roadmap.id.toString() === activeRoadmap?.id.toString()}
                                disabled={!hasCourses}
                                onClick={() => handleSelect(roadmap)}
                            >
                                <ListItemText
                                    primary={roadmap.name}
                                    secondary={!hasCourses ? `No courses for ${term.shortName}` : undefined}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        sx: { overflow: 'hidden', textOverflow: 'ellipsis' },
                                    }}
                                />
                            </MenuItem>
                        );
                    })}
                    <MenuItem
                        component="a"
                        href={PLANNER_LINK}
                        target="_blank"
                        sx={{ borderTop: 1, borderColor: 'divider', mt: 0.5 }}
                    >
                        <Typography variant="body2" color="primary">
                            Open Planner
                        </Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </Grow>
    );
}
