import { Box, Button } from '@mui/material';

import AdvancedSearch from './AdvancedSearch/AdvancedSearch';
import CourseNumberSearchBar from './CourseNumberSearchBar';
import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import GESelector from './GESelector';
import SectionCodeSearchBar from './SectionCodeSearchBar';

interface LegacySearchProps {
    onSubmit: VoidFunction;
    onReset: VoidFunction;
}

export function LegacySearch({ onSubmit, onReset }: LegacySearchProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box>
                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                    <DeptSearchBar />
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
