import { Tune } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import type { FormEvent } from 'react';

import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

interface SearchFormProps {
    toggleSearch: () => void;
}

export const SearchForm = ({ toggleSearch }: SearchFormProps) => {
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toggleSearch();
    };

    return (
        <Stack sx={{ height: '100%', overflowX: 'hidden' }}>
            <Box
                component="form"
                onSubmit={onFormSubmit}
                sx={{
                    marginBottom: '20px',
                    flexGrow: 2,
                }}
            >
                <Stack spacing={2}>
                    <Box
                        sx={{
                            borderTop: 'solid 8px transparent',
                            display: 'inline-flex',
                        }}
                    >
                        <TermSelector />
                        <Tooltip title="Toggle Manual Search">
                            <IconButton onClick={toggleManualSearch}>
                                <Tune />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {!manualSearchEnabled ? (
                        <FuzzySearch toggleSearch={toggleSearch} toggleShowLegacySearch={toggleManualSearch} />
                    ) : (
                        <LegacySearch
                            onSubmit={() => {
                                logAnalytics({
                                    category: analyticsEnum.classSearch.title,
                                    action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
                                });
                            }}
                            onReset={RightPaneStore.resetFormValues}
                        />
                    )}
                </Stack>
            </Box>

            <HelpBox />
            <PrivacyPolicyBanner />
        </Stack>
    );
};
