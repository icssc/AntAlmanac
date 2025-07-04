import { Box, Button } from '@mui/material';

import { AdvancedSearch } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearch';
import { CourseNumberSearchBar } from '$components/RightPane/CoursePane/SearchForm/CourseNumberSearchBar';
import { DepartmentSearchBar } from '$components/RightPane/CoursePane/SearchForm/DepartmentSearchBar/DepartmentSearchBar';
import { GeSelector } from '$components/RightPane/CoursePane/SearchForm/GeSelector';
import SectionCodeSearchBar from '$components/RightPane/CoursePane/SearchForm/SectionCodeSearchBar';

interface ManualSearchProps {
    onSubmit: VoidFunction;
    onReset: VoidFunction;
}

export function ManualSearch({ onSubmit, onReset }: ManualSearchProps) {
    return (
        <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" width="100%" gap={2} flexWrap={'wrap'}>
                    <Box sx={{ flex: 1 }}>
                        <DepartmentSearchBar />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <CourseNumberSearchBar />
                    </Box>
                </Box>
                <Box display="flex" width="100%" gap={2} flexWrap={'wrap'}>
                    <Box flex={1}>
                        <GeSelector />
                    </Box>
                    <Box flex={1}>
                        <SectionCodeSearchBar />
                    </Box>
                </Box>
            </Box>

            <AdvancedSearch />

            <Box display="flex" width="100%" gap={2} justifyContent="center">
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
