import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import { SearchWithPlanner } from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps } from 'react';

interface QuickSearchProps {
    toggleSearch: ComponentProps<typeof FuzzySearch>['toggleSearch'];
    labelProps?: ComponentProps<typeof FuzzySearch>['labelProps'];
}

export const QuickSearch = ({ toggleSearch, labelProps }: QuickSearchProps) => {
    const postHog = usePostHog();
    const theme = useTheme();
    const quickSearchStack = `@container quick-search (max-width: ${theme.breakpoints.values.sm}px)`;

    return (
        <Box
            sx={{
                containerType: 'inline-size',
                containerName: 'quick-search',
                minWidth: 0,
            }}
        >
            <Stack direction="row" flexWrap="wrap" alignItems="center" gap={2} useFlexGap sx={{ minWidth: 0 }}>
                <Box
                    sx={{
                        flex: '2 1 200px',
                        minWidth: 'min(100%, 200px)',
                        maxWidth: '100%',
                        [quickSearchStack]: {
                            flex: '1 1 100%',
                            minWidth: 0,
                        },
                    }}
                >
                    <FuzzySearch toggleSearch={toggleSearch} postHog={postHog} labelProps={labelProps} />
                </Box>
                <Typography
                    component="span"
                    sx={{
                        flexShrink: 0,
                        [quickSearchStack]: {
                            display: 'none',
                        },
                    }}
                >
                    or
                </Typography>
                <Box
                    sx={{
                        flex: '1 1 180px',
                        minWidth: 'min(100%, 180px)',
                        maxWidth: '100%',
                        [quickSearchStack]: {
                            flex: '1 1 100%',
                            minWidth: 0,
                        },
                    }}
                >
                    <SearchWithPlanner labelProps={labelProps} />
                </Box>
            </Stack>
        </Box>
    );
};
