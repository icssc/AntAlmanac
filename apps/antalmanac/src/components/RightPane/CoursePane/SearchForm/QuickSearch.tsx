import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { SearchWithPlanner } from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { Box, Button, Stack } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps, useCallback } from 'react';

interface QuickSearchProps {
    toggleSearch: ComponentProps<typeof FuzzySearch>['toggleSearch'];
    labelProps?: ComponentProps<typeof FuzzySearch>['labelProps'];
}

export const QuickSearch = ({ toggleSearch, labelProps }: QuickSearchProps) => {
    const postHog = usePostHog();

    const runCompsciShortcut = useCallback(() => {
        const term = RightPaneStore.getFormData().term;
        RightPaneStore.resetFormValues();
        RightPaneStore.setTerm(term);
        RightPaneStore.updateFormValue('deptValue', 'COMPSCI');
        toggleSearch();
    }, [toggleSearch]);

    return (
        <Box
            sx={{
                containerType: 'inline-size',
                containerName: 'quick-search',
                minWidth: 0,
            }}
        >
            <Stack spacing={1} sx={{ minWidth: 0 }}>
                <FuzzySearch toggleSearch={toggleSearch} postHog={postHog} labelProps={labelProps} />
                <Stack direction="row" alignItems="stretch" gap={1} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
                    <SearchWithPlanner />
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={runCompsciShortcut}
                        sx={{ flex: '1 1 0', minWidth: 'min(100%, 140px)', maxWidth: '100%' }}
                    >
                        COMPSCI
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};
