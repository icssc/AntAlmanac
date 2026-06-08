import { SignInDialog } from '$components/dialogs/SignInDialog';
import { HorizontalRightDivider } from '$components/HorizontalRightDivider';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { PillSplitButton } from '$components/RightPane/CoursePane/SearchForm/PillSplitButton';
import {
    useCourseSearchForm,
    useCourseSearchParam,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { getRoadmapTermRelation, getSearchableRoadmapCourseIds, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Route } from '@mui/icons-material';
import { Box, Grow, ListItemText, MenuItem, Typography } from '@mui/material';
import type { AATerm, Roadmap } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

function getRoadmapCourseIds(roadmap: Roadmap, term: AATerm): string[] {
    return getSearchableRoadmapCourseIds(roadmap, term);
}

function hasSearchableCoursesForTerm(roadmap: Roadmap, term: AATerm): boolean {
    return getSearchableRoadmapCourseIds(roadmap, term).length > 0;
}

type RoadmapMenuItemsProps = {
    roadmaps: Roadmap[];
    term: AATerm;
    activeRoadmapId: string | null;
    onSelect: (roadmap: Roadmap) => void;
};

function RoadmapMenuItems({ roadmaps, term, activeRoadmapId, onSelect }: RoadmapMenuItemsProps) {
    if (roadmaps.length === 0) {
        return <CreateRoadmapLinkItem verticalPadding="6px" />;
    }

    const grouped: Record<RoadmapTermRelation, Roadmap[]> = {
        [RoadmapTermRelation.IncludesTerm]: [],
        [RoadmapTermRelation.ExcludesTerm]: [],
        [RoadmapTermRelation.NoCourses]: [],
    };

    for (const roadmap of roadmaps) {
        grouped[getRoadmapTermRelation(roadmap, term)].push(roadmap);
    }

    const sections: { relation: RoadmapTermRelation; label: string }[] = [
        { relation: RoadmapTermRelation.IncludesTerm, label: `Includes ${term.shortName}` },
        { relation: RoadmapTermRelation.ExcludesTerm, label: `Doesn't Include ${term.shortName}` },
        { relation: RoadmapTermRelation.NoCourses, label: `No courses for ${term.shortName}` },
    ];

    return (
        <>
            {sections.flatMap(({ relation, label }) => {
                const items = grouped[relation];
                if (items.length === 0) {
                    return [];
                }

                return [
                    <Box key={`header-${relation}`} component="li" sx={{ listStyle: 'none' }}>
                        <HorizontalRightDivider>
                            <Typography variant="body2" fontSize="0.75rem">
                                {label}
                            </Typography>
                        </HorizontalRightDivider>
                    </Box>,
                    ...items.map((roadmap) => {
                        const hasCourses =
                            relation === RoadmapTermRelation.IncludesTerm && hasSearchableCoursesForTerm(roadmap, term);

                        return (
                            <MenuItem
                                key={roadmap.id}
                                selected={roadmap.id.toString() === activeRoadmapId}
                                disabled={!hasCourses}
                                onClick={() => onSelect(roadmap)}
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
                    }),
                ];
            })}
            <MenuItem component="a" href={PLANNER_LINK} target="_blank" divider sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="primary">
                    Open Planner
                </Typography>
            </MenuItem>
        </>
    );
}

export const RoadmapPill = memo(() => {
    const [term] = useCourseSearchParam('term');
    const { setField } = useCourseSearchForm();
    const { showResults } = useCourseSearchView();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);
    const hasAnimatedInRef = useRef(false);

    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const {
        plannerRoadmaps: realRoadmaps,
        isPlannerLoading,
        loadPlannerRoadmaps,
    } = usePlannerStore(
        useShallow((s) => ({
            plannerRoadmaps: s.plannerRoadmaps,
            isPlannerLoading: s.isPlannerLoading,
            loadPlannerRoadmaps: s.loadPlannerRoadmaps,
        }))
    );

    // TODO: Remove mock override before merging.
    const usingMockRoadmaps = MOCK_ROADMAPS.length > 0;
    const plannerRoadmaps = usingMockRoadmaps ? MOCK_ROADMAPS : realRoadmaps;
    const isSignedIn = usingMockRoadmaps || sessionIsValid;

    const sortedRoadmaps = useMemo(() => {
        return plannerRoadmaps.toSorted((a, b) => {
            const aIncludesTerm = getRoadmapTermRelation(a, term) === RoadmapTermRelation.IncludesTerm;
            const bIncludesTerm = getRoadmapTermRelation(b, term) === RoadmapTermRelation.IncludesTerm;
            if (aIncludesTerm === bIncludesTerm) {
                return 0;
            }
            return aIncludesTerm ? -1 : 1;
        });
    }, [plannerRoadmaps, term]);

    useEffect(() => {
        if (usingMockRoadmaps) return;
        if (sessionIsValid && realRoadmaps.length === 0 && !isPlannerLoading) {
            void loadPlannerRoadmaps();
        }
    }, [usingMockRoadmaps, sessionIsValid, realRoadmaps.length, isPlannerLoading, loadPlannerRoadmaps]);

    const roadmapsForTerm = useMemo(() => {
        return sortedRoadmaps.filter((roadmap) => hasSearchableCoursesForTerm(roadmap, term));
    }, [sortedRoadmaps, term]);

    const activeRoadmap = useMemo(() => {
        if (selectedId) {
            return (
                roadmapsForTerm.find((roadmap) => roadmap.id.toString() === selectedId) ?? roadmapsForTerm[0] ?? null
            );
        }
        return roadmapsForTerm[0] ?? null;
    }, [roadmapsForTerm, selectedId]);

    const searchWithRoadmap = useCallback(
        (roadmap: Roadmap) => {
            const ids = getRoadmapCourseIds(roadmap, term);
            if (ids.length === 0) {
                openSnackbar('error', `No courses found in "${roadmap.name}" for ${term.shortName}`);
                return;
            }

            setField('courseIds', ids);
            showResults();
        },
        [setField, showResults, term]
    );

    const handlePrimaryClick = useCallback(() => {
        if (!isSignedIn) {
            setSignInOpen(true);
            return;
        }

        if (!activeRoadmap) return;
        searchWithRoadmap(activeRoadmap);
    }, [activeRoadmap, isSignedIn, searchWithRoadmap]);

    const handleToggleMenu = useCallback(() => {
        if (!isSignedIn) {
            setSignInOpen(true);
            return;
        }

        setMenuOpen((open) => !open);
        if (!usingMockRoadmaps && realRoadmaps.length === 0) {
            void loadPlannerRoadmaps();
        }
    }, [isSignedIn, loadPlannerRoadmaps, realRoadmaps.length, usingMockRoadmaps]);

    const handleSelect = useCallback(
        (roadmap: Roadmap) => {
            setSelectedId(roadmap.id.toString());
            setMenuOpen(false);
            searchWithRoadmap(roadmap);
        },
        [searchWithRoadmap]
    );

    // TODO: Restore sessionIsValid-only gate before merging (drop usingMockRoadmaps bypass).
    const showPill = isSignedIn && (usingMockRoadmaps || (!isPlannerLoading && roadmapsForTerm.length > 0));
    const showMenu = roadmapsForTerm.length > 1;

    const pill = (
        <Box sx={{ display: 'inline-flex' }}>
            <PillSplitButton
                label={activeRoadmap?.name ?? 'Roadmap'}
                icon={<Route />}
                disabled={!activeRoadmap}
                onPrimaryClick={handlePrimaryClick}
                open={menuOpen}
                onToggleMenu={handleToggleMenu}
                onCloseMenu={() => setMenuOpen(false)}
                toggleAriaLabel="Select a different roadmap"
            >
                {showMenu ? (
                    <RoadmapMenuItems
                        roadmaps={sortedRoadmaps}
                        term={term}
                        activeRoadmapId={activeRoadmap?.id.toString() ?? null}
                        onSelect={handleSelect}
                    />
                ) : null}
            </PillSplitButton>
        </Box>
    );

    return (
        <>
            {showPill ? (
                hasAnimatedInRef.current ? (
                    pill
                ) : (
                    <Grow
                        in
                        appear
                        onEntered={() => {
                            hasAnimatedInRef.current = true;
                        }}
                    >
                        {pill}
                    </Grow>
                )
            ) : null}
            <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} feature="PlannerSearch" />
        </>
    );
});

RoadmapPill.displayName = 'RoadmapPill';
