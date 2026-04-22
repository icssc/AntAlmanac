// import { usePlannerRoadmaps } from '$hooks/usePlanner';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { Roadmap } from '@packages/antalmanac-types';

const SearchWithPlannerButton = () => {
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

    return (
        <Autocomplete
            options={roadmaps}
            disabled={!sessionIsValid}
            getOptionLabel={(roadmap) => roadmap.id.toString()}
            sx={{ minWidth: '25%' }}
            renderInput={(props) => {
                return <TextField {...props} variant="outlined" size="small" placeholder="Select planner roadmap" />;
            }}
            renderOption={(props, option) => {
                return (
                    <MenuItem {...props} key={option.id} onClick={() => search(option.id)}>
                        {option.name}
                    </MenuItem>
                );
            }}
        />
    );
};
export default SearchWithPlannerButton;
