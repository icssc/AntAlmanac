import { GE_LIST, QUICK_SEARCH_SHORTCUT_PILL_SX } from '$components/RightPane/CoursePane/SearchForm/constants';
import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { SearchWithPlanner } from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { School, Search } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps, useCallback } from 'react';

const GE3_ENTRY = GE_LIST.find((g) => g.value === 'GE-3');

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

    const runGe3Shortcut = useCallback(() => {
        if (!GE3_ENTRY) {
            return;
        }
        const term = RightPaneStore.getFormData().term;
        RightPaneStore.resetFormValues();
        RightPaneStore.setTerm(term);
        RightPaneStore.updateFormValue('ge', GE3_ENTRY.value);
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
                <Stack
                    direction="row"
                    alignItems="stretch"
                    gap={1}
                    flexWrap="nowrap"
                    sx={{ minWidth: 0, width: '100%' }}
                >
                    <SearchWithPlanner />
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={runCompsciShortcut}
                        startIcon={<Search fontSize="small" />}
                        sx={QUICK_SEARCH_SHORTCUT_PILL_SX}
                    >
                        <Typography
                            component="span"
                            variant="body2"
                            noWrap
                            sx={{ flex: '1 1 auto', minWidth: 0, textAlign: 'left' }}
                        >
                            COMPSCI
                        </Typography>
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={runGe3Shortcut}
                        disabled={!GE3_ENTRY}
                        startIcon={<School fontSize="small" />}
                        sx={QUICK_SEARCH_SHORTCUT_PILL_SX}
                    >
                        <Typography
                            component="span"
                            variant="body2"
                            noWrap
                            sx={{ flex: '1 1 auto', minWidth: 0, textAlign: 'left' }}
                        >
                            {GE3_ENTRY?.shortLabel ?? 'GE III (3)'}
                        </Typography>
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};
