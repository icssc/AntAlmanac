import RightDivider from '$components/RightDivider';
import { PLANNER_SEARCH_PARAM } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import trpc from '$lib/api/trpc';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Autocomplete, Box, CircularProgress, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { useSearchParams } from 'next/navigation';
import { ComponentProps, HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type AutocompleteProps = ComponentProps<typeof Autocomplete>;

// Maps relation types to roadmap IDs
type TermRoadmapGrouping = Record<RoadmapTermRelation, Set<string>>;

function getDefaultTermRoadmapGrouping(): TermRoadmapGrouping {
    return {
        [RoadmapTermRelation.IncludesTerm]: new Set(),
        [RoadmapTermRelation.ExcludesTerm]: new Set(),
        [RoadmapTermRelation.NoCourses]: new Set(),
    };
}

const SearchWithPlanner = () => {
    const [termRoadmapGrouping, setTermRoadmapGrouping] = useState<TermRoadmapGrouping>(getDefaultTermRoadmapGrouping);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    const { sessionIsValid, isPlannerLoading, plannerRoadmaps } = useSessionStore(
        useShallow((state) => ({
            sessionIsValid: state.sessionIsValid,
            isPlannerLoading: state.isPlannerLoading,
            plannerRoadmaps: state.plannerRoadmaps,
        }))
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

    const search = async (roadmapId: Roadmap['id']): Promise<boolean> => {
        const roadmap = plannerRoadmaps.find((roadmap) => roadmap.id.toString() === roadmapId.toString());
        if (!roadmap) {
            openSnackbar('error', "Couldn't find selected roadmap!");
            return false;
        }

        const { year, quarter } = RightPaneStore.getTermParts();
        const quarterPlan = getQuarterPlan(roadmap, year, quarter);
        if (!quarterPlan) {
            openSnackbar('error', `The provided roadmap does not contain ${year} ${quarter}`);
            return false;
        }
        try {
            setIsLoadingSearch(true);
            const courses = await trpc.course.getMultiple.query({
                courseIds: quarterPlan.courses.map((coursePlan) => coursePlan.courseId),
            });
            const searchData = courses.map(({ department, courseNumber }) => ({ deptValue: department, courseNumber }));

            RightPaneStore.setMultiSearchData(searchData);
            displaySections();
        } catch (error) {
            console.error('Something went wrong while searching with planner:', error);
            openSnackbar('error', 'Something went wrong while searching with planner.');
            return false;
        } finally {
            setIsLoadingSearch(false);
        }
        return true;
    };

    const groupBy = (option: Roadmap) => {
        return doesRoadmapIncludeTerm(option.id) ? RoadmapTermRelation.IncludesTerm : RoadmapTermRelation.ExcludesTerm;
    };

    const renderGroup: AutocompleteProps['renderGroup'] = (params) => {
        const term = RightPaneStore.getFormData().term;
        const includesTerm = params.group === RoadmapTermRelation.IncludesTerm;
        const keyword = includesTerm ? 'Includes' : 'Excludes';

        return (
            <li key={params.key}>
                <RightDivider>
                    <Typography>
                        {keyword} {term}
                    </Typography>
                </RightDivider>
                <ul style={{ padding: 0 }}>{params.children}</ul>
            </li>
        );
    };

    const renderInput: AutocompleteProps['renderInput'] = (props) => {
        return <TextField {...props} variant="outlined" size="small" placeholder={'Search with planner'} />;
    };

    const renderOption = (props: HTMLAttributes<HTMLLIElement>, roadmap: Roadmap) => {
        const menuItem = (
            <MenuItem
                {...props}
                key={roadmap.id}
                onClick={() => search(roadmap.id)}
                disabled={!doesRoadmapIncludeTerm(roadmap.id)}
            >
                <Typography sx={{ marginLeft: 1 }}>{roadmap.name}</Typography>
            </MenuItem>
        );
        if (termRoadmapGrouping[RoadmapTermRelation.NoCourses].has(roadmap.id.toString())) {
            return (
                <Tooltip title="This roadmap has no courses for this term">
                    <span>{menuItem}</span>
                </Tooltip>
            );
        }
        return menuItem;
    };

    useEffect(() => {
        const updateTermRoadmaps = () => {
            const { year, quarter } = RightPaneStore.getTermParts();
            const roadmapsWithTerm: typeof termRoadmapGrouping = getDefaultTermRoadmapGrouping();
            for (const roadmap of plannerRoadmaps) {
                const roadmapTermRelation = getRoadmapTermRelation(roadmap, year, quarter);
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
    }, [searchParams, plannerRoadmaps, hasSearchedWithUrlParams]);

    if (isLoadingSearch) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size="2rem" />
            </Box>
        );
    }

    const searchComponent = (
        <Autocomplete
            options={sortedRoadmaps}
            disabled={!sessionIsValid}
            getOptionLabel={(roadmap) => roadmap.name.toString()}
            loading={isPlannerLoading}
            loadingText="Loading planner..."
            noOptionsText="No roadmaps found"
            groupBy={groupBy}
            renderGroup={renderGroup}
            renderInput={renderInput}
            renderOption={renderOption}
            {...(plannerRoadmaps.length === 0 && {
                slotProps: { popper: { sx: { '& .MuiAutocomplete-noOptions': { padding: 0 } } } },
                noOptionsText: (
                    <MenuItem
                        component="a"
                        href={PLANNER_LINK}
                        target="_blank"
                        sx={(theme) => ({ color: theme.palette.text.primary, paddingTop: 1.5, paddingBottom: 1.5 })}
                    >
                        Create a roadmap!
                    </MenuItem>
                ),
            })}
        />
    );

    if (!sessionIsValid) {
        return (
            <Tooltip title="Sign in to search with planner">
                <span>{searchComponent}</span>
            </Tooltip>
        );
    }

    return searchComponent;
};
export default SearchWithPlanner;
