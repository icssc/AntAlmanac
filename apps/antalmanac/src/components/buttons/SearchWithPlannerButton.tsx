import RightDivider from '$components/RightDivider';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { usePlannerRoadmaps } from '$hooks/usePlanner';
import trpc from '$lib/api/trpc';
import { doesRoadmapIncludeTerm, getQuarterPlan } from '$lib/plannerHelpers';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Autocomplete, AutocompleteRenderGroupParams, MenuItem, TextField, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

enum RoadmapGroup {
    IncludesTerm = 'includes',
    ExcludesTerm = 'excludes',
}

const SearchWithPlannerButton = () => {
    const [termRoadmapIds, setTermRoadmapIds] = useState<Set<string>>(() => new Set());
    const [isLoading, setIsLoading] = useState(false);

    const { sessionIsValid, isPlannerLoading } = useSessionStore(
        useShallow((state) => ({ sessionIsValid: state.sessionIsValid, isPlannerLoading: state.isPlannerLoading }))
    );

    const displaySections = useCoursePaneStore((state) => state.displaySections);

    const { roadmaps } = usePlannerRoadmaps();

    const sortedRoadmaps = useMemo(
        () =>
            roadmaps.toSorted((a, _b) => {
                return termRoadmapIds.has(a.id.toString()) ? -1 : 1;
            }),
        [roadmaps, termRoadmapIds]
    );

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
        return termRoadmapIds.has(option.id.toString()) ? RoadmapGroup.IncludesTerm : RoadmapGroup.ExcludesTerm;
    };

    const renderGroup = (params: AutocompleteRenderGroupParams) => {
        const term = RightPaneStore.getFormData().term;
        const includesTerm = params.group === RoadmapGroup.IncludesTerm;
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
            const roadmapsWithTerm: typeof termRoadmapIds = new Set();
            for (const roadmap of roadmaps) {
                if (doesRoadmapIncludeTerm(roadmap, year, quarter)) {
                    roadmapsWithTerm.add(roadmap.id.toString());
                }
            }
            setTermRoadmapIds(roadmapsWithTerm);
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
            renderOption={(props, option) => {
                return (
                    <MenuItem
                        {...props}
                        key={option.id}
                        onClick={() => search(option.id)}
                        disabled={!termRoadmapIds.has(option.id.toString())}
                    >
                        <Typography sx={{ marginLeft: 1 }}>{option.name}</Typography>
                    </MenuItem>
                );
            }}
        />
    );
};
export default SearchWithPlannerButton;
