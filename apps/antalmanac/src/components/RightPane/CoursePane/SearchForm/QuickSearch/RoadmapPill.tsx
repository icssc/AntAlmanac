import { HorizontalRightDivider } from '$components/HorizontalRightDivider';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { PillSplitButton } from '$components/RightPane/CoursePane/SearchForm/PillSplitButton';
import {
    useCourseSearchForm,
    useCourseSearchParam,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { RoadmapTermRelation, getRoadmapTermRelation, getSearchableRoadmapCourseIds } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { OpenInNew, Search } from '@mui/icons-material';
import { Box, IconButton, ListItemText, MenuItem, Tooltip, Typography } from '@mui/material';
import type { AATerm, Roadmap } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const ROADMAP_PILL_MAX_WIDTH = 220;

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
        { relation: RoadmapTermRelation.ExcludesTerm, label: `Doesn't include ${term.shortName}` },
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
                            <Typography sx={{ fontSize: 12 }}>{label}</Typography>
                        </HorizontalRightDivider>
                    </Box>,
                    ...items.map((roadmap) => {
                        const hasCourses = relation === RoadmapTermRelation.IncludesTerm;

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

export const RoadmapPill = memo(() => {
    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const { plannerRoadmaps, isPlannerLoading, hasLoadedPlannerRoadmaps, loadPlannerRoadmaps } = usePlannerStore(
        useShallow((s) => ({
            plannerRoadmaps: s.plannerRoadmaps,
            isPlannerLoading: s.isPlannerLoading,
            hasLoadedPlannerRoadmaps: s.hasLoadedPlannerRoadmaps,
            loadPlannerRoadmaps: s.loadPlannerRoadmaps,
        }))
    );

    const [term] = useCourseSearchParam('term');
    const { setField } = useCourseSearchForm();
    const { showResults } = useCourseSearchView();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (sessionIsValid && plannerRoadmaps.length === 0 && !isPlannerLoading) {
            void loadPlannerRoadmaps();
        }
    }, [sessionIsValid, plannerRoadmaps.length, isPlannerLoading, loadPlannerRoadmaps]);

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
        return sortedRoadmaps.filter(
            (roadmap) => getRoadmapTermRelation(roadmap, term) === RoadmapTermRelation.IncludesTerm
        );
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
            const ids = getSearchableRoadmapCourseIds(roadmap, term);
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
        if (plannerRoadmaps.length === 0) {
            void loadPlannerRoadmaps();
        }
    }, [loadPlannerRoadmaps, plannerRoadmaps.length]);

    const handleSelect = useCallback(
        (roadmap: Roadmap) => {
            setSelectedId(roadmap.id.toString());
            setMenuOpen(false);
            searchWithRoadmap(roadmap);
        },
        [searchWithRoadmap]
    );

    const showPill = sessionIsValid && hasLoadedPlannerRoadmaps && roadmapsForTerm.length > 0;
    const showMenu = sortedRoadmaps.length > 1;

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
                    Search:&nbsp;{activeRoadmap.name}
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
});

RoadmapPill.displayName = 'RoadmapPill';
