import { Tune } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { useState, useEffect, useCallback, type FormEvent } from 'react';

import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import { PrivacyPolicyBanner } from '$components/RightPane/CoursePane/SearchForm/PrivacyPolicyBanner';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSessionStore } from '$stores/SessionStore';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PPLogo from '$assets/peterportal-shortform-logo.svg'

interface SearchFormProps {
    toggleSearch: () => void;
}

export const SearchForm = ({ toggleSearch }: SearchFormProps) => {
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();
    const [signInOpen, setSignInOpen] = useState(false);
    const isGoogleUser = useSessionStore((s) => s.googleId !== null);
    const isDark = false;
    const filterCourses = useSessionStore((s) => s.filterTakenCourses);
    const setFilterCourses = useSessionStore((s) => s.setFilterTakenCourses);

    const onFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toggleSearch();
        },
        [toggleSearch]
    );

    const toggleFilterCourses = () => {
        if (!isGoogleUser) {
            setSignInOpen(true);
            return;
        }
        setFilterCourses(!filterCourses);
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FuzzySearch
                                toggleSearch={toggleSearch}
                                toggleShowLegacySearch={toggleManualSearch}
                            />
                            <Tooltip
                                arrow
                                title={
                                    <div style={{ fontSize: '0.8rem' }}>
                                        Filter Taken Courses <br /> (Data from PeterPortal.org)
                                    </div>
                                }
                            >
                                <IconButton onClick={toggleFilterCourses}>
                                    <Box component="img" src={PPLogo} style={{ position: 'absolute', top: '60%', left: '5%', width: '35%', height: '35%' }} />
                                    {filterCourses ? <FilterAltIcon /> : <FilterAltOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
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
            <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} isDark={isDark} action="Filtering Courses" />
        </Stack>
    );
};
