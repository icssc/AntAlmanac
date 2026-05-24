import { AdvancedSearch } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearch';
import { CourseNumberSearchBar } from '$components/RightPane/CoursePane/SearchForm/CourseNumberSearchBar';
import { DepartmentSearchBar } from '$components/RightPane/CoursePane/SearchForm/DepartmentSearchBar/DepartmentSearchBar';
import { GeSelector } from '$components/RightPane/CoursePane/SearchForm/GeSelector';
import SectionCodeSearchBar from '$components/RightPane/CoursePane/SearchForm/SectionCodeSearchBar';
import { Box, Button, useTheme } from '@mui/material';

interface ManualSearchProps {
    onSubmit: VoidFunction;
    onReset: VoidFunction;
}

export function ManualSearch({ onSubmit, onReset }: ManualSearchProps) {
    const theme = useTheme();
    const manualSearchSingleColumn = `@container manual-search (max-width: ${theme.breakpoints.values.sm}px)`;

    return (
        <Box
            sx={{
                containerType: 'inline-size',
                containerName: 'manual-search',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    minWidth: 0,
                    [manualSearchSingleColumn]: {
                        gridTemplateColumns: '1fr',
                    },
                }}
            >
                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <DepartmentSearchBar />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <CourseNumberSearchBar />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <GeSelector />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <SectionCodeSearchBar />
                </Box>
            </Box>

            <AdvancedSearch />

            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    gap: 2,
                    justifyContent: 'center',
                }}
            >
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
