import { Footer } from '$components/RightPane/CoursePane/SearchForm/Footer';
import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import SearchWithPlanner from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { LIGHT_BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';
import { alpha, Box, Stack, SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, type FormEvent } from 'react';

interface SearchFormProps {
    toggleSearch: () => void;
}

const QUICKSEARCH_LABEL_SX: SxProps<Theme> = {
    minWidth: '6rem',
};

export const SearchForm = ({ toggleSearch }: SearchFormProps) => {
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();

    const onFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toggleSearch();
        },
        [toggleSearch]
    );

    const toggleSearchMode = (event: React.MouseEvent<HTMLElement>, value: string) => {
        event.preventDefault();
        if (!value) return;
        toggleManualSearch();
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
                        <TermSelector labelProps={!manualSearchEnabled ? { sx: QUICKSEARCH_LABEL_SX } : undefined} />
                    </Box>

                    {!manualSearchEnabled ? (
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <FuzzySearch
                                toggleSearch={toggleSearch}
                                postHog={postHog}
                                labelProps={{ sx: QUICKSEARCH_LABEL_SX }}
                            />
                            <Typography>or</Typography>
                            <Box sx={{ minWidth: '25%' }}>
                                <SearchWithPlanner />
                            </Box>
                        </Stack>
                    ) : (
                        <ManualSearch
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

            <Stack gap={1}>
                <Footer />
                <PrivacyPolicyBanner />
            </Stack>
        </Stack>
    );
};
