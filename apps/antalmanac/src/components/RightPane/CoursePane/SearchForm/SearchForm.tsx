import { Tune } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, type FormEvent } from 'react';

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
    const postHog = usePostHog();

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

                        <Box sx={{ flexShrink: 0 }}>
                            <Tooltip title="Toggle Manual Search">
                                <IconButton onClick={toggleManualSearch}>
                                    <Tune />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {!manualSearchEnabled ? (
                        <FuzzySearch
                            toggleSearch={toggleSearch}
                            toggleShowLegacySearch={toggleManualSearch}
                            postHog={postHog}
                        />
                    ) : (
                        <LegacySearch
                            onSubmit={() => {
                                logAnalytics(postHog, {
                                    category: analyticsEnum.classSearch,
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
