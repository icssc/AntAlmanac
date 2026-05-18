import { SignInDialog } from '$components/dialogs/SignInDialog';
import {
    PLANNER_SEARCH_PARAM,
    QUICK_SEARCH_SHORTCUT_PILL_SX,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { trpc } from '$lib/api/trpc';
import {
    getQuarterPlan,
    getRoadmapTermRelation,
    RoadmapTermRelation,
    shouldSearchPlannerFromParams,
} from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { EventNote, KeyboardArrowDown, OpenInBrowser } from '@mui/icons-material';
import { Box, Button, IconButton, ListSubheader, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { useSearchParams } from 'next/navigation';
import { type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

// Maps relation types to roadmap IDs
type TermRoadmapGrouping = Record<RoadmapTermRelation, Set<string>>;

function getDefaultTermRoadmapGrouping(): TermRoadmapGrouping {
    return {
        [RoadmapTermRelation.IncludesTerm]: new Set(),
        [RoadmapTermRelation.ExcludesTerm]: new Set(),
        [RoadmapTermRelation.NoCourses]: new Set(),
    };
}

export const SearchWithPlanner = () => {
    const [termRoadmapGrouping, setTermRoadmapGrouping] = useState<TermRoadmapGrouping>(getDefaultTermRoadmapGrouping);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const { sessionIsValid, hasCheckedAuth } = useSessionStore(
        useShallow((state) => ({
            sessionIsValid: state.sessionIsValid,
            hasCheckedAuth: state.hasCheckedAuth,
        }))
    );

    const { isPlannerLoading, plannerRoadmaps } = usePlannerStore(
        useShallow((state) => ({ isPlannerLoading: state.isPlannerLoading, plannerRoadmaps: state.plannerRoadmaps }))
    );

    const { displaySections, hasSearchedWithUrlParams, setHasSearchedWithUrlParams } = useCoursePaneStore(
        useShallow((state) => ({
            displaySections: state.displaySections,
            hasSearchedWithUrlParams: state.hasSearchedWithUrlParams,
            setHasSearchedWithUrlParams: state.setHasSearchedWithUrlParams,
        }))
    );

    const searchParams = useSearchParams();

    const doesRoadmapIncludeTerm = useCallback(
        (roadmapId: Roadmap['id']) => {
            return termRoadmapGrouping[RoadmapTermRelation.IncludesTerm].has(roadmapId.toString());
        },
        [termRoadmapGrouping]
    );

    const sortedRoadmaps = useMemo(() => {
        return plannerRoadmaps.toSorted((a, b) => {
            const aIncludesTerm = doesRoadmapIncludeTerm(a.id);
            const bIncludesTerm = doesRoadmapIncludeTerm(b.id);
            if (aIncludesTerm === bIncludesTerm) {
                return 0;
            }
            return aIncludesTerm ? -1 : 1;
        });
    }, [plannerRoadmaps, doesRoadmapIncludeTerm]);

    const closeMenu = () => setMenuAnchor(null);

    const search = useCallback(
        async (roadmapId: Roadmap['id']): Promise<boolean> => {
            const roadmap = plannerRoadmaps.find((roadmap) => roadmap.id.toString() === roadmapId.toString());
            if (!roadmap) {
                openSnackbar('error', "Couldn't find selected roadmap!");
                return false;
            }

            const term = RightPaneStore.getFormData().term;
            const quarterPlan = getQuarterPlan(roadmap, term);
            if (!quarterPlan) {
                openSnackbar('error', `The provided roadmap does not contain ${term.shortName}`);
                return false;
            }
            try {
                setIsLoadingSearch(true);
                const courseIds = quarterPlan.courses
                    .filter((coursePlan) => !coursePlan.courseId.startsWith('CUSTOM#'))
                    .map((coursePlan) => coursePlan.courseId);
                const courses = await trpc.course.getMultiple.query({ courseIds });
                const searchData = courses.map(({ department, courseNumber }) => ({
                    deptValue: department,
                    courseNumber,
                }));

                RightPaneStore.setMultiSearchData(searchData);
                displaySections();
            } catch (error) {
                console.error('Something went wrong while searching with Planner:', error);
                openSnackbar('error', 'Something went wrong while searching with Planner.');
                return false;
            } finally {
                setIsLoadingSearch(false);
            }
            return true;
        },
        [plannerRoadmaps, displaySections]
    );

    const roadmapMenuItems = useMemo(() => {
        if (plannerRoadmaps.length === 0) {
            return null;
        }
        const termShortName = RightPaneStore.getFormData().term.shortName;
        const items: ReactNode[] = [];
        let previousGroup: RoadmapTermRelation | undefined;

        for (const roadmap of sortedRoadmaps) {
            const group = doesRoadmapIncludeTerm(roadmap.id)
                ? RoadmapTermRelation.IncludesTerm
                : RoadmapTermRelation.ExcludesTerm;
            if (group !== previousGroup) {
                const keyword = group === RoadmapTermRelation.IncludesTerm ? 'Includes' : "Doesn't include";
                items.push(
                    <ListSubheader
                        key={`roadmap-group-${group}-${termShortName}`}
                        disableSticky
                        sx={{ typography: 'caption', lineHeight: 2.25, color: 'text.secondary' }}
                    >
                        {keyword} {termShortName}
                    </ListSubheader>
                );
                previousGroup = group;
            }

            const noCourses = termRoadmapGrouping[RoadmapTermRelation.NoCourses].has(roadmap.id.toString());
            const disabled = !doesRoadmapIncludeTerm(roadmap.id);

            const menuItem = (
                <MenuItem
                    key={roadmap.id}
                    disabled={disabled}
                    dense
                    title={noCourses ? 'This roadmap has no courses for this term' : undefined}
                    onClick={() => {
                        if (disabled) {
                            return;
                        }
                        closeMenu();
                        void search(roadmap.id);
                    }}
                    sx={{ py: 0.5, pr: 0.5 }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        gap={1}
                        minWidth={0}
                    >
                        <Typography variant="body2" noWrap title={roadmap.name} sx={{ flex: '1 1 auto', minWidth: 0 }}>
                            {roadmap.name}
                        </Typography>
                        <Tooltip title="Open Planner">
                            <IconButton
                                size="small"
                                href={PLANNER_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                component="a"
                                aria-label="Open Planner"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <OpenInBrowser fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </MenuItem>
            );

            items.push(menuItem);
        }

        return items;
    }, [plannerRoadmaps.length, sortedRoadmaps, termRoadmapGrouping, doesRoadmapIncludeTerm, search]);

    useEffect(() => {
        const updateTermRoadmaps = () => {
            const term = RightPaneStore.getFormData().term;
            const roadmapsWithTerm: typeof termRoadmapGrouping = getDefaultTermRoadmapGrouping();
            for (const roadmap of plannerRoadmaps) {
                const roadmapTermRelation = getRoadmapTermRelation(roadmap, term);
                roadmapsWithTerm[roadmapTermRelation].add(roadmap.id.toString());
            }
            setTermRoadmapGrouping(roadmapsWithTerm);
        };

        updateTermRoadmaps();

        RightPaneStore.addListener('formDataChange', updateTermRoadmaps);

        return () => {
            RightPaneStore.removeListener('formDataChange', updateTermRoadmaps);
        };
    }, [plannerRoadmaps]);

    useEffect(() => {
        if (plannerRoadmaps.length === 0 || hasSearchedWithUrlParams) {
            return;
        }

        const roadmapId = searchParams.get(PLANNER_SEARCH_PARAM);
        if (roadmapId) {
            (async () => {
                const success = await search(roadmapId);
                if (success) {
                    setHasSearchedWithUrlParams(true);
                }
            })();
        }
    }, [searchParams, plannerRoadmaps, hasSearchedWithUrlParams, search, setHasSearchedWithUrlParams]);

    useEffect(() => {
        if (hasCheckedAuth && !sessionIsValid && shouldSearchPlannerFromParams()) {
            setOpenSignInDialog(true);
        }
    }, [sessionIsValid, hasCheckedAuth]);

    const handleRoadmapButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (!sessionIsValid) {
            setOpenSignInDialog(true);
            return;
        }
        setMenuAnchor(event.currentTarget);
    };

    const roadmapButton = (
        <Button
            variant="outlined"
            size="small"
            color="secondary"
            disabled={isLoadingSearch}
            onClick={handleRoadmapButtonClick}
            startIcon={<EventNote fontSize="small" />}
            endIcon={<KeyboardArrowDown sx={{ flexShrink: 0 }} />}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            sx={{
                ...QUICK_SEARCH_SHORTCUT_PILL_SX,
                width: '100%',
                '& .MuiButton-endIcon': { marginLeft: 'auto', flexShrink: 0 },
            }}
        >
            <Typography
                component="span"
                variant="body2"
                noWrap
                sx={{ flex: '1 1 auto', minWidth: 0, textAlign: 'left' }}
            >
                {isLoadingSearch ? 'Loading…' : isPlannerLoading ? 'Roadmaps…' : 'Roadmap'}
            </Typography>
        </Button>
    );

    const menu = (
        <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            slotProps={{
                paper: {
                    sx: { maxHeight: 360, minWidth: menuAnchor ? menuAnchor.clientWidth : undefined },
                },
            }}
        >
            {plannerRoadmaps.length === 0 ? (
                <CreateRoadmapLinkItem verticalPadding="10px" value="" />
            ) : (
                roadmapMenuItems
            )}
        </Menu>
    );

    if (!sessionIsValid) {
        return (
            <>
                <Tooltip title="Sign in to search with Planner">
                    <span>{roadmapButton}</span>
                </Tooltip>
                {menu}
                <SignInDialog
                    open={openSignInDialog}
                    onClose={() => setOpenSignInDialog(false)}
                    feature="PlannerSearch"
                />
            </>
        );
    }

    return (
        <>
            {roadmapButton}
            {menu}
        </>
    );
};
