import RightDivider from '$components/RightDivider';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import trpc from '$lib/api/trpc';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { PLANNER_LINK } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Autocomplete, Box, CircularProgress, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { ComponentProps, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type AutocompleteProps = ComponentProps<typeof Autocomplete>;

type TermRoadmapIdMapping = Record<RoadmapTermRelation, Set<string>>;

function getDefaultTermRoadmapIdMapping(): TermRoadmapIdMapping {
    return {
        [RoadmapTermRelation.IncludesTerm]: new Set(),
        [RoadmapTermRelation.ExcludesTerm]: new Set(),
        [RoadmapTermRelation.NoCourses]: new Set(),
    };
}

const SearchWithPlanner = () => {
    const [termRoadmapIdMapping, setTermRoadmapIdMapping] =
        useState<TermRoadmapIdMapping>(getDefaultTermRoadmapIdMapping);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    const { sessionIsValid, isPlannerLoading, plannerRoadmaps } = useSessionStore(
        useShallow((state) => ({
            sessionIsValid: state.sessionIsValid,
            isPlannerLoading: state.isPlannerLoading,
            plannerRoadmaps: state.plannerRoadmaps,
        }))
    );

    const displaySections = useCoursePaneStore((state) => state.displaySections);

    const doesRoadmapIncludeTerm = (roadmapId: Roadmap['id']) => {
        return termRoadmapIdMapping[RoadmapTermRelation.IncludesTerm].has(roadmapId.toString());
    };

    const sortedRoadmaps = useMemo(() => {
        return plannerRoadmaps.toSorted((a, _b) => {
            return doesRoadmapIncludeTerm(a.id) ? -1 : 1;
        });
    }, [plannerRoadmaps, termRoadmapIdMapping]);

    const search = async (roadmapId: Roadmap['id']) => {
        const roadmap = plannerRoadmaps.find((roadmap) => roadmap.id === roadmapId);
        if (!roadmap) {
            openSnackbar('error', "Couldn't find selected roadmap!");
            return;
        }

        const { year, quarter } = RightPaneStore.getTermParts();
        const quarterPlan = getQuarterPlan(roadmap, year, quarter);
        if (!quarterPlan) {
            openSnackbar('error', "Couldn't find selected roadmap!");
            return;
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
        }
        setIsLoadingSearch(false);
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
        if (termRoadmapIdMapping[RoadmapTermRelation.NoCourses].has(roadmap.id.toString())) {
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
            const roadmapsWithTerm: typeof termRoadmapIdMapping = getDefaultTermRoadmapIdMapping();
            for (const roadmap of plannerRoadmaps) {
                const roadmapTermRelation = getRoadmapTermRelation(roadmap, year, quarter);
                roadmapsWithTerm[roadmapTermRelation].add(roadmap.id.toString());
            }
            setTermRoadmapIdMapping(roadmapsWithTerm);
        };

        updateTermRoadmaps();

        RightPaneStore.addListener('formDataChange', updateTermRoadmaps);

        return () => {
            RightPaneStore.removeListener('formDataChange', updateTermRoadmaps);
        };
    }, [plannerRoadmaps]);

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
