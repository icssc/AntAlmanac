import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, type FormEvent } from 'react';

import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearch';
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
                    <ToggleButtonGroup
                        fullWidth
                        size="medium"
                        color="primary"
                        value={manualSearchEnabled ? 'manual' : 'quick'}
                        exclusive
                        aria-label="Search selection"
                        sx={{ paddingTop: 1 }}
                        onChange={() => toggleManualSearch()}
                    >
                        <ToggleButton value="quick">Quick Search</ToggleButton>
                        <ToggleButton value="manual">Manual Search</ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TermSelector />
                    </Box>

                    {!manualSearchEnabled ? (
                        <FuzzySearch toggleSearch={toggleSearch} toggleShowManualSearch={toggleManualSearch} />
                    ) : (
                        <ManualSearch
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
