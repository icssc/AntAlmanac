import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import SearchWithPlanner from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import { Typography, useMediaQuery } from '@mui/material';
import { Box, Stack, useTheme } from '@mui/system';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps } from 'react';

interface Props {
    toggleSearch: ComponentProps<typeof FuzzySearch>['toggleSearch'];
    labelProps?: ComponentProps<typeof FuzzySearch>['labelProps'];
}

const QuickSearch = ({ toggleSearch, labelProps }: Props) => {
    const postHog = usePostHog();
    const theme = useTheme();
    const doSplitSearch = useMediaQuery(theme.breakpoints.down('md'));

    const fuzzySearch = <FuzzySearch toggleSearch={toggleSearch} postHog={postHog} labelProps={labelProps} />;
    const plannerSearch = <SearchWithPlanner labelProps={labelProps} />;

    return doSplitSearch ? (
        <>
            {fuzzySearch}
            {plannerSearch}
        </>
    ) : (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {fuzzySearch}
            <Typography>or</Typography>
            <Box sx={{ width: '37%' }}>{plannerSearch}</Box>
        </Stack>
    );
};
export default QuickSearch;
