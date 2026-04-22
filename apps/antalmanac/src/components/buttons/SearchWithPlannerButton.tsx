import RightDivider from '$components/RightDivider';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { doesRoadmapIncludeTerm } from '$lib/plannerHelpers';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { Autocomplete, AutocompleteRenderGroupParams, MenuItem, TextField, Typography } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';

enum RoadmapGroup {
    IncludesTerm = 'includes',
    ExcludesTerm = 'excludes',
}

const SearchWithPlannerButton = () => {
    const [termRoadmapIds, setTermRoadmapIds] = useState<Set<string>>(() => new Set());

    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);

    const displaySections = useCoursePaneStore((state) => state.displaySections);

    // const { roadmaps } = usePlannerRoadmaps();
    // TODO
    const roadmaps = [
        {
            id: 1,
            name: 'hi',
        },
        {
            id: 2,
            name: 'aaaaa',
        },
    ];

    const sortedRoadmaps = useMemo(
        () =>
            roadmaps.toSorted((a, _b) => {
                return termRoadmapIds.has(a.id.toString()) ? -1 : 1;
            }),
        [roadmaps, termRoadmapIds]
    );

    const search = (roadmapId: Roadmap['id']) => {
        console.log('searching', roadmapId);
        RightPaneStore.setMultiSearchData([
            {
                deptValue: 'I&C SCI',
                courseNumber: '6B',
            },
            {
                deptValue: 'I&C SCI',
                courseNumber: '6D',
            },
            {
                deptValue: 'SOC SCI',
                courseNumber: 'H1E',
            },
            {
                deptValue: 'BIO SCI',
                courseNumber: '199W',
            },
        ]);
        displaySections();
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
    }, []);

    return (
        <Autocomplete
            options={sortedRoadmaps}
            disabled={!sessionIsValid}
            getOptionLabel={(roadmap) => roadmap.name.toString()}
            groupBy={groupBy}
            renderGroup={renderGroup}
            sx={{ minWidth: '30%' }}
            renderInput={(props) => {
                return <TextField {...props} variant="outlined" size="small" placeholder="Search with planner" />;
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
