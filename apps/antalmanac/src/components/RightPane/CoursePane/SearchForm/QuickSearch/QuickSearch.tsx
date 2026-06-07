import { FuzzySearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/FuzzySearch';
import { RoadmapPill } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/RoadmapPill';
import { Stack } from '@mui/material';

export const QuickSearch = () => {
    return (
        <Stack gap={1}>
            <FuzzySearch />

            {/* Shortcut pills row — roadmap pill + future pills (department, recent search, etc.) */}
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                <RoadmapPill />
            </Stack>
        </Stack>
    );
};
