import { SignInDialog } from '$components/dialogs/SignInDialog';
import { HorizontalRightDivider } from '$components/HorizontalRightDivider';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { COURSE_SEARCH_PLANNER_KEY } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseIds,
    useCourseSearchParam,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { OpenInBrowser } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { parseAsString, useQueryState } from 'nuqs';
import { ComponentProps, HTMLAttributes, Key, useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

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

export const SearchWithPlanner = () => {
    const [term] = useCourseSearchParam('term');
    const { showResults } = useCourseSearchView();
    const { setCourseIds } = useCourseIds();
    const [plannerSearchParam, setPlannerSearchParam] = useQueryState(
        COURSE_SEARCH_PLANNER_KEY,
        parseAsString.withOptions({ history: 'replace' })
    );
    const [termRoadmapGrouping, setTermRoadmapGrouping] = useState<TermRoadmapGrouping>(getDefaultTermRoadmapGrouping);
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
        (roadmapId: Roadmap['id']): boolean => {
            const roadmap = plannerRoadmaps.find((roadmap) => roadmap.id.toString() === roadmapId.toString());
            if (!roadmap) {
                openSnackbar('error', "Couldn't find selected roadmap!");
                return false;
            }

            const quarterPlan = getQuarterPlan(roadmap, term);
            if (!quarterPlan) {
                openSnackbar('error', `The provided roadmap does not contain ${term.shortName}`);
                return false;
            }

            const ids = quarterPlan.courses
                .filter((coursePlan) => !coursePlan.courseId.startsWith('CUSTOM#'))
                .map((coursePlan) => coursePlan.courseId);

            setCourseIds(ids);
            showResults();
            return true;
        },
        [plannerRoadmaps, setCourseIds, showResults, term]
    );

    const groupBy = (option: Roadmap) => {
        return doesRoadmapIncludeTerm(option.id) ? RoadmapTermRelation.IncludesTerm : RoadmapTermRelation.ExcludesTerm;
    };

    const renderGroup: AutocompleteProps['renderGroup'] = (params) => {
        const termShortName = term.shortName;
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

    const renderOption = (props: HTMLAttributes<HTMLLIElement> & { key: Key }, roadmap: Roadmap) => {
        const { key: _autocompleteKey, ...restProps } = props;
        const menuItem = (
            <Box
                key={_autocompleteKey}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ paddingRight: 1 }}
            >
                <MenuItem
                    {...restProps}
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
                <Tooltip key={_autocompleteKey} title="This roadmap has no courses for this term">
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
                const roadmapTermRelation = getRoadmapTermRelation(roadmap, term);
                roadmapsWithTerm[roadmapTermRelation].add(roadmap.id.toString());
            }
            setTermRoadmapGrouping(roadmapsWithTerm);
        };

        updateTermRoadmaps();
    }, [plannerRoadmaps, term]);

    useEffect(() => {
        if (plannerRoadmaps.length === 0 || hasSearchedWithUrlParamsRef.current) {
            return;
        }

        if (plannerSearchParam) {
            const success = search(plannerSearchParam);
            if (success) {
                hasSearchedWithUrlParamsRef.current = true;
                void setPlannerSearchParam(null);
            }
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
            disabled={!sessionIsValid}
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
                placeholder: 'Select roadmap from Planner',
                fullWidth: true,
            }}
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
