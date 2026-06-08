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
import { OpenInNew, Search } from '@mui/icons-material';
import { Box, IconButton, ListItemText, MenuItem, Tooltip, Typography } from '@mui/material';
import type { AATerm, Roadmap } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

// TODO: Remove mock data before merging. Hardcoded roadmaps for testing the pill UI.

type MockQuarter = 'Fall' | 'Winter' | 'Spring' | 'Summer1' | 'Summer2' | 'Summer10wk';

function mockYearPlan(startYear: number, quarters: Partial<Record<MockQuarter, string[]>>): Roadmap['content'][number] {
    const quarterOrder: MockQuarter[] = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'];
    return {
        name: `${startYear}-${startYear + 1}`,
        startYear,
        quarters: quarterOrder
            .filter((name) => name in quarters)
            .map((name) => ({
                name,
                courses: (quarters[name] ?? []).map((courseId) => ({ courseId })),
            })),
    };
}

const MOCK_ROADMAPS_ALL: Roadmap[] = [
    {
        id: 'mock-1',
        name: 'CS',
        content: [2024, 2025, 2026].map((startYear) =>
            mockYearPlan(startYear, {
                Fall: ['COMPSCI161'],
                Winter: ['COMPSCI162'],
                Spring: ['COMPSCI171'],
            })
        ),
    },
    {
        id: 'mock-2',
        name: 'GE Roadmap',
        content: [2024, 2025, 2026].map((startYear) =>
            mockYearPlan(startYear, {
                Fall: ['WRITING39B'],
                Winter: ['HUMANIT1AS'],
                Spring: ['MATH2A'],
            })
        ),
    },
    {
        id: 'mock-3',
        name: 'Pre-2026 Plan',
        content: [2023, 2024].map((startYear) =>
            mockYearPlan(startYear, {
                Fall: ['WRITING39B'],
                Winter: ['HUMANIT1AS'],
                Spring: ['MATH2A'],
            })
        ),
    },
    {
        id: 'mock-4',
        name: 'Spring TBD',
        content: [
            mockYearPlan(2025, {
                Fall: ['ECON20A'],
                Winter: ['ECON20B'],
                Spring: [],
            }),
        ],
    },
    {
        id: 'mock-5',
        name: 'Fall 2026 Only',
        content: [
            mockYearPlan(2026, {
                Fall: ['COMPSCI178'],
            }),
        ],
    },
    {
        id: 'mock-6',
        name: 'No Spring Quarter',
        content: [
            mockYearPlan(2025, {
                Fall: ['PHYSICS7A'],
                Winter: ['PHYSICS7B'],
            }),
        ],
    },
];

const MOCK_ROADMAPS_SINGLE: Roadmap[] = [
    {
        id: 'mock-single',
        name: 'CS Major Roadmap',
        content: [
            mockYearPlan(2025, {
                Fall: ['COMPSCI161'],
                Winter: ['COMPSCI162'],
                Spring: ['COMPSCI171'],
            }),
        ],
    },
];

const MOCK_ROADMAPS_SUMMER2: Roadmap[] = [
    {
        id: 'mock-summer2-a',
        name: '2026 Summer Session 2',
        content: [
            mockYearPlan(2025, {
                Summer2: ['MATH2D', 'CHEM1C'],
            }),
        ],
    },
    {
        id: 'mock-summer2-b',
        name: 'Summer GE Progress',
        content: [
            mockYearPlan(2025, {
                Summer2: ['WRITING39C', 'HUMANIT1ES'],
            }),
        ],
    },
    {
        id: 'mock-summer2-c',
        name: 'CS Summer Catch-up',
        content: [
            mockYearPlan(2025, {
                Summer2: ['COMPSCI161', 'COMPSCI162'],
            }),
        ],
    },
    {
        id: 'mock-summer2-exclude-a',
        name: 'No Summer Quarters',
        content: [
            mockYearPlan(2025, {
                Fall: ['ECON20A'],
                Winter: ['ECON20B'],
                Spring: ['MATH2A'],
            }),
        ],
    },
    {
        id: 'mock-summer2-exclude-b',
        name: 'Summer Session 1 Only',
        content: [
            mockYearPlan(2025, {
                Summer1: ['PHYSICS7C'],
            }),
        ],
    },
    {
        id: 'mock-summer2-exclude-c',
        name: '2024 Archive',
        content: [
            mockYearPlan(2024, {
                Fall: ['WRITING39B'],
                Winter: ['HUMANIT1AS'],
                Spring: ['MATH2A'],
            }),
        ],
    },
    {
        id: 'mock-summer2-empty',
        name: 'Summer2 TBD',
        content: [
            mockYearPlan(2025, {
                Summer2: [],
            }),
        ],
    },
];

const MOCK_ENABLED = MOCK_ROADMAPS_ALL.length > 0;

const ROADMAP_PILL_MAX_WIDTH = 200;

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
        { relation: RoadmapTermRelation.IncludesTerm, label: 'Includes term' },
        { relation: RoadmapTermRelation.ExcludesTerm, label: "Doesn't include term" },
        { relation: RoadmapTermRelation.NoCourses, label: 'No courses for term' },
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
                            <Typography sx={{ fontSize: 12 }}>{label}</Typography>
                        </HorizontalRightDivider>
                    </Box>,
                    ...items.map((roadmap) => {
                        const hasCourses =
                            relation === RoadmapTermRelation.IncludesTerm && hasSearchableCoursesForTerm(roadmap, term);

                        return (
                            <MenuItem
                                key={roadmap.id}
                                dense
                                selected={roadmap.id.toString() === activeRoadmapId}
                                onClick={() => {
                                    if (hasCourses) {
                                        onSelect(roadmap);
                                    }
                                }}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    pr: 0.5,
                                    fontSize: 12,
                                    ...(!hasCourses && { opacity: 0.5 }),
                                }}
                            >
                                <ListItemText
                                    primary={roadmap.name}
                                    primaryTypographyProps={{
                                        fontSize: 12,
                                        noWrap: true,
                                        sx: { overflow: 'hidden', textOverflow: 'ellipsis' },
                                    }}
                                    sx={{ flex: 1, minWidth: 0, my: 0 }}
                                />
                                <Tooltip title="Open in Planner">
                                    <IconButton
                                        component="a"
                                        href={`${PLANNER_LINK}?plan=${encodeURIComponent(String(roadmap.id))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        aria-label={`Open ${roadmap.name} in Planner`}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <OpenInNew sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </MenuItem>
                        );
                    }),
                ];
            })}
        </>
    );
}

type RoadmapPillInstanceProps = {
    plannerRoadmaps: Roadmap[];
    isSignedIn: boolean;
    usingMockRoadmaps: boolean;
    isPlannerLoading: boolean;
    realRoadmaps: Roadmap[];
    loadPlannerRoadmaps: () => Promise<void>;
};

const RoadmapPillInstance = memo(
    ({
        plannerRoadmaps,
        isSignedIn,
        usingMockRoadmaps,
        isPlannerLoading,
        realRoadmaps,
        loadPlannerRoadmaps,
    }: RoadmapPillInstanceProps) => {
        const [term] = useCourseSearchParam('term');
        const { setField } = useCourseSearchForm();
        const { showResults } = useCourseSearchView();
        const [selectedId, setSelectedId] = useState<string | null>(null);
        const [menuOpen, setMenuOpen] = useState(false);

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

        const roadmapsForTerm = useMemo(() => {
            return sortedRoadmaps.filter((roadmap) => hasSearchableCoursesForTerm(roadmap, term));
        }, [sortedRoadmaps, term]);

        const activeRoadmap = useMemo(() => {
            if (selectedId) {
                return (
                    roadmapsForTerm.find((roadmap) => roadmap.id.toString() === selectedId) ??
                    roadmapsForTerm[0] ??
                    null
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
            if (!activeRoadmap) return;
            searchWithRoadmap(activeRoadmap);
        }, [activeRoadmap, searchWithRoadmap]);

        const handleToggleMenu = useCallback(() => {
            setMenuOpen((open) => !open);
            if (!usingMockRoadmaps && realRoadmaps.length === 0) {
                void loadPlannerRoadmaps();
            }
        }, [loadPlannerRoadmaps, realRoadmaps.length, usingMockRoadmaps]);

        const handleSelect = useCallback(
            (roadmap: Roadmap) => {
                setSelectedId(roadmap.id.toString());
                setMenuOpen(false);
                searchWithRoadmap(roadmap);
            },
            [searchWithRoadmap]
        );

        // TODO: Restore sessionIsValid-only gate before merging (drop usingMockRoadmaps bypass).
        const showPill = isSignedIn && !isPlannerLoading && roadmapsForTerm.length > 0;
        const showMenu = roadmapsForTerm.length > 1;

        useEffect(() => {
            if (!showMenu) {
                setMenuOpen(false);
            }
        }, [showMenu]);

        if (!showPill || !activeRoadmap) {
            return null;
        }

        return (
            <PillSplitButton
                sx={{ maxWidth: ROADMAP_PILL_MAX_WIDTH }}
                menuWidth={ROADMAP_PILL_MAX_WIDTH}
                label={
                    <Box
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                    >
                        Planner:&nbsp;{activeRoadmap.name}
                    </Box>
                }
                icon={<Search />}
                onPrimaryClick={handlePrimaryClick}
                {...(showMenu
                    ? {
                          open: menuOpen,
                          onToggleMenu: handleToggleMenu,
                          onCloseMenu: () => setMenuOpen(false),
                          children: (
                              <RoadmapMenuItems
                                  roadmaps={sortedRoadmaps}
                                  term={term}
                                  activeRoadmapId={activeRoadmap.id.toString()}
                                  onSelect={handleSelect}
                              />
                          ),
                      }
                    : {})}
            />
        );
    }
);

RoadmapPillInstance.displayName = 'RoadmapPillInstance';

export const RoadmapPill = memo(() => {
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
    const usingMockRoadmaps = MOCK_ENABLED;
    const isSignedIn = usingMockRoadmaps || sessionIsValid;

    useEffect(() => {
        if (usingMockRoadmaps) return;
        if (sessionIsValid && realRoadmaps.length === 0 && !isPlannerLoading) {
            void loadPlannerRoadmaps();
        }
    }, [usingMockRoadmaps, sessionIsValid, realRoadmaps.length, isPlannerLoading, loadPlannerRoadmaps]);

    const instanceProps = {
        isSignedIn,
        usingMockRoadmaps,
        isPlannerLoading,
        realRoadmaps,
        loadPlannerRoadmaps,
    };

    if (usingMockRoadmaps) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    minWidth: 0,
                    maxWidth: '100%',
                }}
            >
                <RoadmapPillInstance {...instanceProps} plannerRoadmaps={MOCK_ROADMAPS_SINGLE} />
                <RoadmapPillInstance {...instanceProps} plannerRoadmaps={MOCK_ROADMAPS_ALL} />
                <RoadmapPillInstance {...instanceProps} plannerRoadmaps={MOCK_ROADMAPS_SUMMER2} />
            </Box>
        );
    }

    return <RoadmapPillInstance {...instanceProps} plannerRoadmaps={realRoadmaps} />;
});

RoadmapPill.displayName = 'RoadmapPill';
