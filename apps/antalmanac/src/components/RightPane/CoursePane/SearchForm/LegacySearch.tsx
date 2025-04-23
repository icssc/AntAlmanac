import { Box, Button } from '@mui/material';

import AdvancedSearch from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearch';
import CourseNumberSearchBar from '$components/RightPane/CoursePane/SearchForm/CourseNumberSearchBar';
import { DepartmentSearchBar } from '$components/RightPane/CoursePane/SearchForm/DepartmentSearchBar/DepartmentSearchBar';
import GESelector from '$components/RightPane/CoursePane/SearchForm/GESelector';
import SectionCodeSearchBar from '$components/RightPane/CoursePane/SearchForm/SectionCodeSearchBar';

interface LegacySearchProps {
    onSubmit: VoidFunction;
    onReset: VoidFunction;
}

export function LegacySearch({ onSubmit, onReset }: LegacySearchProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box>
                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                    <DepartmentSearchBar />
                    <CourseNumberSearchBar />
                </Box>
                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                    <GESelector />
                    <SectionCodeSearchBar />
                </Box>
            </Box>

            <AdvancedSearch />

            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
                <Button color="primary" variant="contained" type="submit" onClick={onSubmit} sx={{ width: '50%' }}>
                    Search
                </Button>

                <Button variant="contained" color="secondary" onClick={onReset}>
                    Reset
                </Button>
            </Box>
        </Box>
    );
}
