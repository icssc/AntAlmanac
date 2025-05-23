import { Box, Button, ButtonGroup, Stack } from '@mui/material';
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
                    <ButtonGroup
                        fullWidth
                        disableElevation
                        size="large"
                        aria-label="Search selection"
                        sx={{ paddingTop: 1 }}
                    >
                        <Button
                            color={manualSearchEnabled ? 'inherit' : 'primary'}
                            variant={manualSearchEnabled ? 'outlined' : 'contained'}
                            sx={{
                                color: manualSearchEnabled ? 'grey' : undefined,
                            }}
                            onClick={
                                manualSearchEnabled
                                    ? toggleManualSearch
                                    : (e) => {
                                          e.preventDefault();
                                      }
                            }
                        >
                            Quick Search
                        </Button>
                        <Button
                            color={manualSearchEnabled ? 'primary' : 'inherit'}
                            variant={manualSearchEnabled ? 'contained' : 'outlined'}
                            sx={{
                                color: manualSearchEnabled ? undefined : 'grey',
                            }}
                            onClick={
                                manualSearchEnabled
                                    ? (e) => {
                                          e.preventDefault();
                                      }
                                    : toggleManualSearch
                            }
                        >
                            Manual Search
                        </Button>
                    </ButtonGroup>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TermSelector />
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
