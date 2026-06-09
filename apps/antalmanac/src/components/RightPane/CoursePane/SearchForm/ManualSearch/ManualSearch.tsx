import { AdvancedSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearch';
import { CourseNumberField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearchFields/CourseNumberField';
import { DepartmentField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearchFields/DepartmentField';
import { GeField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearchFields/GeField';
import { SectionCodeField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearchFields/SectionCodeField';
import { ManualSearchResetButton } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearchResetButton';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { CONTAINER_NAMES } from '$lib/containerQueries';
import { Box, Button, useTheme } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

export function ManualSearch() {
    const theme = useTheme();
    const postHog = usePostHog();
    const manualSearchSingleColumn = `@container ${CONTAINER_NAMES.manualSearch} (max-width: ${theme.breakpoints.values.sm}px)`;

    const handleSubmit = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
        });
    }, [postHog]);

    return (
        <Box
            sx={{
                containerType: 'inline-size',
                containerName: CONTAINER_NAMES.manualSearch,
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
                    <DepartmentField />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <CourseNumberField />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <GeField />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <SectionCodeField />
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
                <Button color="primary" variant="contained" type="submit" onClick={handleSubmit} sx={{ width: '50%' }}>
                    Search
                </Button>

                <ManualSearchResetButton />
            </Box>
        </Box>
    );
}
