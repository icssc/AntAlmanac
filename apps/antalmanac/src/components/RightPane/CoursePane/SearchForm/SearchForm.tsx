import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { useCallback, type FormEvent } from 'react';

import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { AdvancedSearch } from './AdvancedSearch/AdvancedSearch';

interface SearchFormProps {
    toggleSearch: () => void;
}

export const SearchForm = ({ toggleSearch }: SearchFormProps) => {
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();

    const onFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toggleSearch();
        },
        [toggleSearch]
    );

    return (
        <Stack sx={{ height: '100%', overflowX: 'hidden' }}>
            <Box
                component="form"
                onSubmit={onFormSubmit}
                sx={{
                    marginBottom: 2.5,
                    flexGrow: 2,
                }}
            >
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', paddingTop: 1, alignItems: 'center', gap: 1 }}>
                        <TermSelector />
                    </Box>

                    <Box sx={manualSearchEnabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
                        <FuzzySearch
                            toggleSearch={toggleSearch}
                            toggleShowLegacySearch={toggleManualSearch}
                        />
                    </Box>

                    <Button
                        onClick={toggleManualSearch}
                        sx={{ textTransform: 'none', width: 'auto', display: 'flex', justifyContent: 'start' }}
                    >
                        <Typography noWrap variant="body1">
                            Advanced Search Options
                        </Typography>
                        {manualSearchEnabled ? <ExpandLess /> : <ExpandMore />}
                    </Button>

                    {manualSearchEnabled && (
                        <>
                            <LegacySearch
                                onSubmit={() => {
                                    logAnalytics({
                                        category: analyticsEnum.classSearch.title,
                                        action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
                                    });
                                }}
                                onReset={RightPaneStore.resetFormValues}
                            />
                        </>
                    )}
                </Stack>
            </Box>
            <HelpBox />
            <PrivacyPolicyBanner />
        </Stack>
    );
};
