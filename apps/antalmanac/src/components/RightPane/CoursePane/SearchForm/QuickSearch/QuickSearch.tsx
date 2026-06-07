import { FuzzySearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/FuzzySearch';
import { RoadmapPill } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/RoadmapPill';
import { Stack } from '@mui/material';

export const QuickSearch = () => {
    return (
        <Stack gap={1}>
            <FuzzySearch />

            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                <RoadmapPill />
            </Stack>
        </Stack>
    );
};
