import { Footer } from '$components/RightPane/CoursePane/SearchForm/Footer';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { QuickSearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch';
import { useCourseSearchPane } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import type { CourseSearchMode } from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { LIGHT_BLUE } from '$src/globals';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { useThemeStore } from '$stores/SettingsStore';
import { alpha, Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, type SyntheticEvent } from 'react';

export const SearchForm = () => {
    const { formData, manualSearchEnabled, resetForm, setFields, setSearchMode, clearView, submitSearch } =
        useCourseSearchPane();
    const isDark = useThemeStore((store) => store.isDark);
    const { savedManualSearch, saveManualSearch, clearManualSearch } = useSavedSearchStore((store) => ({
        savedManualSearch: store.savedManualSearch,
        saveManualSearch: store.saveManualSearch,
        clearManualSearch: store.clearManualSearch,
    }));
    const postHog = usePostHog();

    const onFormSubmit = useCallback(
        (event: SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault();
            submitSearch(formData);
        },
        [formData, submitSearch]
    );

    const toggleSearchMode = (_event: React.MouseEvent<HTMLElement>, value: CourseSearchMode | null) => {
        if (value === null) return;

        switch (value) {
            case COURSE_SEARCH_MODE.MANUAL:
                setSearchMode(COURSE_SEARCH_MODE.MANUAL);
                if (savedManualSearch) {
                    setFields(savedManualSearch);
                }
                break;
            case COURSE_SEARCH_MODE.QUICK:
                saveManualSearch(formData);
                setSearchMode(COURSE_SEARCH_MODE.QUICK);
                resetForm({ preserveTerm: true });
                clearView();
                break;
        }
    };

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
                        color="secondary"
                        value={manualSearchEnabled ? COURSE_SEARCH_MODE.MANUAL : COURSE_SEARCH_MODE.QUICK}
                        exclusive
                        aria-label="Search selection"
                        sx={{
                            paddingTop: 1,
                            '& .MuiToggleButton-root.Mui-selected': {
                                backgroundColor: isDark ? alpha(LIGHT_BLUE, 0.05) : undefined,
                            },
                        }}
                        onChange={toggleSearchMode}
                    >
                        <ToggleButton value={COURSE_SEARCH_MODE.QUICK}>Quick Search</ToggleButton>
                        <ToggleButton value={COURSE_SEARCH_MODE.MANUAL}>Manual Search</ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TermSelector />
                    </Box>

                    {!manualSearchEnabled ? (
                        <QuickSearch />
                    ) : (
                        <ManualSearch
                            onSubmit={() => {
                                logAnalytics(postHog, {
                                    category: analyticsEnum.classSearch,
                                    action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
                                });
                            }}
                            onReset={() => {
                                clearManualSearch();
                                resetForm();
                            }}
                        />
                    )}
                </Stack>
            </Box>

            <Stack gap={1}>
                <Footer />
                <PrivacyPolicyBanner />
            </Stack>
        </Stack>
    );
};
