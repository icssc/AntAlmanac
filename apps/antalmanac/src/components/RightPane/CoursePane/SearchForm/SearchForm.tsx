import { alpha, Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useQueryState, useQueryStates } from 'nuqs';
import { usePostHog } from 'posthog-js/react';
import { useCallback, type FormEvent } from 'react';

import { Footer } from '$components/RightPane/CoursePane/SearchForm/Footer';
import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { getDefaultFormValues, searchParsers, type SearchMode } from '$lib/searchParams';
import { LIGHT_BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';

interface SearchFormProps {
    toggleSearch: () => void;
}

export const SearchForm = ({ toggleSearch }: SearchFormProps) => {
    const [mode, setMode] = useQueryState('mode', searchParsers.mode);
    const [formData, setFormData] = useQueryStates(searchParsers);
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();
    const { stashedManualFields, setStashedManualFields } = useCoursePaneStore();

    const onFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toggleSearch();
        },
        [toggleSearch]
    );

    const toggleSearchMode = (_event: React.MouseEvent<HTMLElement>, value: SearchMode | null) => {
        if (!value) return;
        if (value === 'quick') {
            setStashedManualFields({ ...formData });
            setFormData({ ...getDefaultFormValues(), term: formData.term, mode: 'quick' });
        } else if (stashedManualFields) {
            setFormData({ ...stashedManualFields, mode: 'manual' });
            setStashedManualFields(null);
        } else {
            setMode(value);
        }
    };

    const handleReset = useCallback(() => {
        const defaults = getDefaultFormValues();
        setFormData({ ...defaults, term: formData.term, mode: formData.mode });
    }, [setFormData, formData.term, formData.mode]);

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
                        value={mode}
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

                    {mode === 'quick' ? (
                        <FuzzySearch postHog={postHog} />
                    ) : (
                        <ManualSearch
                            onSubmit={() => {
                                logAnalytics(postHog, {
                                    category: analyticsEnum.classSearch,
                                    action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
                                });
                            }}
                            onReset={handleReset}
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
