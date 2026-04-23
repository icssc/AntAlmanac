import RightDivider from '$components/RightDivider';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { usePlannerRoadmaps } from '$hooks/usePlanner';
import trpc from '$lib/api/trpc';
import { getQuarterPlan, getRoadmapTermRelation, RoadmapTermRelation } from '$lib/plannerHelpers';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Autocomplete, AutocompleteRenderGroupParams, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type TermRoadmapIdMapping = Record<RoadmapTermRelation, Set<string>>;

function getDefaultTermRoadmapIdMapping(): TermRoadmapIdMapping {
    return {
        [RoadmapTermRelation.IncludesTerm]: new Set(),
        [RoadmapTermRelation.ExcludesTerm]: new Set(),
        [RoadmapTermRelation.NoCourses]: new Set(),
    };
}

const SearchWithPlannerButton = () => {
    const [termRoadmapIdMapping, setTermRoadmapIdMapping] =
        useState<TermRoadmapIdMapping>(getDefaultTermRoadmapIdMapping);
    const [isLoading, setIsLoading] = useState(false);

    const { sessionIsValid, isPlannerLoading } = useSessionStore(
        useShallow((state) => ({ sessionIsValid: state.sessionIsValid, isPlannerLoading: state.isPlannerLoading }))
    );

    const displaySections = useCoursePaneStore((state) => state.displaySections);

    const { roadmaps } = usePlannerRoadmaps();

    const doesRoadmapIncludeTerm = (roadmapId: Roadmap['id']) => {
        return termRoadmapIdMapping[RoadmapTermRelation.IncludesTerm].has(roadmapId.toString());
    };

    const sortedRoadmaps = useMemo(() => {
        return roadmaps.toSorted((a, _b) => {
            return doesRoadmapIncludeTerm(a.id) ? -1 : 1;
        });
    }, [roadmaps, termRoadmapIdMapping]);

    const search = async (roadmapId: Roadmap['id']) => {
        const roadmap = roadmaps.find((roadmap) => roadmap.id === roadmapId);
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
            setIsLoading(true);
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
        setIsLoading(false);
    };

    const groupBy = (option: Roadmap) => {
        return doesRoadmapIncludeTerm(option.id) ? RoadmapTermRelation.IncludesTerm : RoadmapTermRelation.ExcludesTerm;
    };

    const renderGroup = (params: AutocompleteRenderGroupParams) => {
        const term = RightPaneStore.getFormData().term;
        const includesTerm = params.group === RoadmapTermRelation.IncludesTerm;
        const keyword = includesTerm ? 'Includes' : 'Excludes';

        return (
            <>
                <RightDivider key={keyword}>
                    <Typography>
                        {keyword} {term}
                    </Typography>
                </RightDivider>
                {params.children}
            </>
        );
    };

    useEffect(() => {
        const updateTermRoadmaps = () => {
            const { year, quarter } = RightPaneStore.getTermParts();
            const roadmapsWithTerm: typeof termRoadmapIdMapping = getDefaultTermRoadmapIdMapping();
            for (const roadmap of roadmaps) {
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
    }, [roadmaps]);

    return (
        <Autocomplete
            options={sortedRoadmaps}
            disabled={!sessionIsValid}
            getOptionLabel={(roadmap) => roadmap.name.toString()}
            loading={isPlannerLoading}
            loadingText="Loading planner..."
            noOptionsText="No roadmaps found"
            groupBy={groupBy}
            renderGroup={renderGroup}
            sx={{ minWidth: '30%' }}
            renderInput={(props) => {
                return (
                    <TextField
                        {...props}
                        variant="outlined"
                        size="small"
                        placeholder={isLoading ? 'Loading...' : 'Search with planner'}
                    />
                );
            }}
            renderOption={(props, roadmap) => {
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
                        <Tooltip title="This roadmap doesn't have any courses for this term">
                            <span>{menuItem}</span>
                        </Tooltip>
                    );
                }
                return menuItem;
            }}
        />
    );
};
export default SearchWithPlannerButton;
