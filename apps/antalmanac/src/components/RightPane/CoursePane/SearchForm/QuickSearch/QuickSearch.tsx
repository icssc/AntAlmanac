import { FuzzySearch } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/FuzzySearch';
import { SearchWithPlanner } from '$components/RightPane/CoursePane/SearchForm/QuickSearch/SearchWithPlanner';
import { containerQuery, containerSx, containers } from '$lib/containerQueries';
import { Box, Stack, Typography, useTheme } from '@mui/material';

export const QuickSearch = () => {
    const theme = useTheme();
    const quickSearchStack = containerQuery(containers.quickSearch, theme.breakpoints.values.sm);

    return (
        <Box
            sx={{
                ...containerSx(containers.quickSearch),
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
                    <FuzzySearch />
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
                    <SearchWithPlanner />
                </Box>
            </Stack>
        </Box>
    );
};
