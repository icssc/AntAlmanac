import { Tune } from '@mui/icons-material';
import { Box, FormControl, IconButton, Stack, Tooltip } from '@mui/material';
import { FormEvent, useCallback, useState } from 'react';

import RightPaneStore from '../../RightPaneStore';

import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import HelpBox from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import TermSelector from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { getLocalStorageHelpBoxDismissalTime, setLocalStorageHelpBoxDismissalTime } from '$lib/localStorage';
import { useCoursePaneStore } from '$stores/CoursePaneStore';


interface SearchFormProps {
    toggleSearch: VoidFunction;
}

export function SearchForm({ toggleSearch }: SearchFormProps) {
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();
    const [helpBoxVisibility, setHelpBoxVisibility] = useState(true);

    const onFormSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
    }, []);

    const currentMonthIndex = new Date().getMonth(); // 0=Jan

    // Active months: February/March for Spring planning, May/June for Fall planning, July/August for Summer planning,
    // and November/December for Winter planning
    const activeMonthIndices = [false, true, true, false, true, true, true, true, false, false, true, true];

    // Display the help box only if more than 30 days has passed since the last dismissal and
    // the current month is an active month
    const helpBoxDismissalTime = getLocalStorageHelpBoxDismissalTime();
    const dismissedRecently =
        helpBoxDismissalTime !== null && Date.now() - parseInt(helpBoxDismissalTime) < 30 * 24 * 3600 * 1000;
    const displayHelpBox = helpBoxVisibility && !dismissedRecently && activeMonthIndices[currentMonthIndex];

    const onHelpBoxDismiss = () => {
        setLocalStorageHelpBoxDismissalTime(Date.now().toString());
        setHelpBoxVisibility(false);
    };

    return (
        <Stack sx={{ overflowX: 'hidden', height: '100%' }} spacing={2.5}>
            <FormControl onSubmit={onFormSubmit} sx={{ display: 'flex', flexGrow: 1 }}>
                <Stack spacing={2}>
                    <Box
                        sx={{
                            borderTop: 'solid 8px transparent',
                            display: 'inline-flex',
                        }}
                    >
                        <TermSelector
                            changeTerm={(field: string, value: string) => RightPaneStore.updateFormValue(field, value)}
                            fieldName={'term'}
                        />
                        <Tooltip title="Toggle Manual Search">
                            <IconButton onClick={toggleManualSearch}>
                                <Tune />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {!manualSearchEnabled ? (
                        <Stack direction="row" id="searchBar">
                            <FuzzySearch toggleSearch={toggleSearch} toggleShowLegacySearch={toggleManualSearch} />
                        </Stack>
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
            </FormControl>

            <Box>
                {displayHelpBox && <HelpBox onDismiss={onHelpBoxDismiss} />}
                <PrivacyPolicyBanner />
            </Box>
        </Stack>
    );
}
