import { Footer } from '$components/RightPane/CoursePane/SearchForm/Footer';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { QuickSearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { LIGHT_BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';
import { alpha, Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, type FormEvent } from 'react';

export const SearchForm = () => {
    const { formData, resetAllPreservingTerm, searchMode, setSearchMode, clearView, submitSearch } =
        useCourseSearchUrlState();
    const setAdvancedSearchEnabled = useCoursePaneStore((store) => store.setAdvancedSearchEnabled);
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();
    const manualSearchEnabled = searchMode === 'manual';

    const onFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!manualSearchEnabled) {
                return;
            }
            submitSearch(formData);
        },
        [formData, manualSearchEnabled, submitSearch]
    );

    const toggleSearchMode = (event: React.MouseEvent<HTMLElement>, value: string) => {
        event.preventDefault();
        if (!value) return;
        if (value === 'manual') {
            void setSearchMode('manual');
            return;
        }

        setAdvancedSearchEnabled(false);
        void setSearchMode('quick');
        void resetAllPreservingTerm();
        // Params are cleared; let auto-derive show the form (view=null)
        void clearView();
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
                        value={manualSearchEnabled ? 'manual' : 'quick'}
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
                        <ToggleButton value="quick">Quick Search</ToggleButton>
                        <ToggleButton value="manual">Manual Search</ToggleButton>
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
                                void resetAllPreservingTerm();
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
