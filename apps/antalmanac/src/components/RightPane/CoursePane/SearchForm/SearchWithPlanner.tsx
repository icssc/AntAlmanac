import { SignInDialog } from '$components/dialogs/SignInDialog';
import { HorizontalRightDivider } from '$components/HorizontalRightDivider';
import { PLANNER_SEARCH_PARAM } from '$components/RightPane/CoursePane/SearchForm/constants';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/courseSearchUrlState';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { trpc } from '$lib/api/trpc';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { OpenInBrowser } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { parseAsString, useQueryState } from 'nuqs';
import { ComponentProps, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface SearchWithPlannerProps {
    labelProps?: ComponentProps<typeof LabeledAutocomplete>['labelProps'];
}

type AutocompleteProps = ComponentProps<typeof LabeledAutocomplete>['autocompleteProps'];

// Maps relation types to roadmap IDs
type TermRoadmapGrouping = Record<RoadmapTermRelation, Set<string>>;

function getDefaultTermRoadmapGrouping(): TermRoadmapGrouping {
    return {
        [RoadmapTermRelation.IncludesTerm]: new Set(),
        [RoadmapTermRelation.ExcludesTerm]: new Set(),
        [RoadmapTermRelation.NoCourses]: new Set(),
    };
}

export const SearchWithPlanner = ({ labelProps }: SearchWithPlannerProps) => {
    const { formData, showResults } = useCourseSearchUrlState();
    const [plannerSearchParam, setPlannerSearchParam] = useQueryState(
        PLANNER_SEARCH_PARAM,
        parseAsString.withOptions({ history: 'replace' })
    );
    const [termRoadmapGrouping, setTermRoadmapGrouping] = useState<TermRoadmapGrouping>(getDefaultTermRoadmapGrouping);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const hasSearchedWithUrlParamsRef = useRef(false);

    const { sessionIsValid, hasCheckedAuth } = useSessionStore(
        useShallow((state) => ({
            sessionIsValid: state.sessionIsValid,

            hasCheckedAuth: state.hasCheckedAuth,
        }))
    );

    const { isPlannerLoading, plannerRoadmaps } = usePlannerStore(
        useShallow((state) => ({ isPlannerLoading: state.isPlannerLoading, plannerRoadmaps: state.plannerRoadmaps }))
    );

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

    const search = useCallback(
        async (roadmapId: Roadmap['id']): Promise<boolean> => {
            const roadmap = plannerRoadmaps.find((roadmap) => roadmap.id.toString() === roadmapId.toString());
            if (!roadmap) {
                openSnackbar('error', "Couldn't find selected roadmap!");
                return false;
            }

            const term = formData.term;
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

                RightPaneStore.setMultiSearchData(searchData, term);
                void showResults();
            } catch (error) {
                console.error('Something went wrong while searching with Planner:', error);
                openSnackbar('error', 'Something went wrong while searching with Planner.');
                return false;
            } finally {
                setIsLoadingSearch(false);
            }
            return true;
        },
        [formData.term, plannerRoadmaps, showResults]
    );

    const groupBy = (option: Roadmap) => {
        return doesRoadmapIncludeTerm(option.id) ? RoadmapTermRelation.IncludesTerm : RoadmapTermRelation.ExcludesTerm;
    };

    const renderGroup: AutocompleteProps['renderGroup'] = (params) => {
        const termShortName = formData.term.shortName;
        const includesTerm = params.group === RoadmapTermRelation.IncludesTerm;
        const keyword = includesTerm ? 'Includes' : "Doesn't Include";

        return (
            <li key={params.key}>
                <HorizontalRightDivider>
                    <Typography>
                        {keyword} {termShortName}
                    </Typography>
                </HorizontalRightDivider>
                <ul style={{ padding: 0 }}>{params.children}</ul>
            </li>
        );
    };

    const renderOption = (props: HTMLAttributes<HTMLLIElement>, roadmap: Roadmap) => {
        const menuItem = (
            <Box
                key={roadmap.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ paddingRight: 1 }}
            >
                <MenuItem
                    {...props}
                    key={roadmap.id}
                    onClick={() => search(roadmap.id)}
                    disabled={!doesRoadmapIncludeTerm(roadmap.id)}
                    sx={{ width: '100%' }}
                >
                    <Typography
                        sx={{ marginLeft: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                        title={roadmap.name}
                    >
                        {roadmap.name}
                    </Typography>
                </MenuItem>

                <Tooltip title="Open Planner">
                    <IconButton href={PLANNER_LINK} size="small" aria-label="Open Planner">
                        <OpenInBrowser fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        );
        if (termRoadmapGrouping[RoadmapTermRelation.NoCourses].has(roadmap.id.toString())) {
            return (
                <Tooltip key={roadmap.id} title="This roadmap has no courses for this term">
                    <span>{menuItem}</span>
                </Tooltip>
            );
        }
        return menuItem;
    };

    useEffect(() => {
        const updateTermRoadmaps = () => {
            const roadmapsWithTerm: typeof termRoadmapGrouping = getDefaultTermRoadmapGrouping();
            for (const roadmap of plannerRoadmaps) {
                const roadmapTermRelation = getRoadmapTermRelation(roadmap, formData.term);
                roadmapsWithTerm[roadmapTermRelation].add(roadmap.id.toString());
            }
            setTermRoadmapGrouping(roadmapsWithTerm);
        };

        updateTermRoadmaps();
    }, [formData.term, plannerRoadmaps]);

    useEffect(() => {
        if (plannerRoadmaps.length === 0 || hasSearchedWithUrlParamsRef.current) {
            return;
        }

        if (plannerSearchParam) {
            (async () => {
                const success = await search(plannerSearchParam);
                if (success) {
                    hasSearchedWithUrlParamsRef.current = true;
                    void setPlannerSearchParam(null);
                }
            })();
        }
    }, [plannerSearchParam, plannerRoadmaps, search, setPlannerSearchParam]);

    useEffect(() => {
        if (hasCheckedAuth && !sessionIsValid && plannerSearchParam !== null) {
            setOpenSignInDialog(true);
        }
    }, [plannerSearchParam, sessionIsValid, hasCheckedAuth]);

    const searchComponent = (
        <LabeledAutocomplete
            label="Roadmap"
            disabled={!sessionIsValid || isLoadingSearch}
            autocompleteProps={{
                options: sortedRoadmaps,
                getOptionLabel: (roadmap) => roadmap.name.toString(),
                loading: isPlannerLoading,
                loadingText: 'Loading Planner...',
                noOptionsText: 'No roadmaps found',
                groupBy: groupBy,
                renderGroup: renderGroup,
                renderOption: renderOption,
                ...(plannerRoadmaps.length === 0 && {
                    slotProps: { popper: { sx: { '& .MuiAutocomplete-noOptions': { padding: 0 } } } },
                    noOptionsText: <CreateRoadmapLinkItem />,
                }),
            }}
            textFieldProps={{
                placeholder: isLoadingSearch ? 'Loading...' : 'Select roadmap from Planner',
                fullWidth: true,
            }}
            labelProps={labelProps}
            loading={isLoadingSearch}
            isAligned
        />
    );

    if (!sessionIsValid) {
        return (
            <>
                <Tooltip title="Sign in to search with Planner">
                    <span>{searchComponent}</span>
                </Tooltip>

                <SignInDialog
                    open={openSignInDialog}
                    onClose={() => setOpenSignInDialog(false)}
                    feature="PlannerSearch"
                />
            </>
        );
    }

    return searchComponent;
};
