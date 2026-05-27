import { Footer } from '$components/RightPane/CoursePane/SearchForm/Footer';
import { ManualSearch } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/ManualSearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { QuickSearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/QuickSearch';
import { SearchFormModeToggle } from '$components/RightPane/CoursePane/SearchForm/SearchFormModeToggle';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import { useCourseSearchMode, useCourseSearchSubmit } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Box, Stack } from '@mui/material';
import { useCallback, type SyntheticEvent } from 'react';

export const SearchForm = () => {
    const { manualSearchEnabled } = useCourseSearchMode();
    const { submitSearch } = useCourseSearchSubmit();

    const onFormSubmit = useCallback(
        (event: SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault();
            submitSearch();
        },
        [submitSearch]
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
                    <SearchFormModeToggle />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TermSelector />
                    </Box>

                    {!manualSearchEnabled ? <QuickSearch /> : <ManualSearch />}
                </Stack>
            </Box>

            <Stack gap={1}>
                <Footer />
                <PrivacyPolicyBanner />
            </Stack>
        </Stack>
    );
};
