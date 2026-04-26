import FuzzySearch from '$components/RightPane/CoursePane/SearchForm/FuzzySearch';
import SearchWithPlanner from '$components/RightPane/CoursePane/SearchForm/SearchWithPlanner';
import { useIsMobile } from '$hooks/useIsMobile';
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps } from 'react';

interface Props {
    toggleSearch: ComponentProps<typeof FuzzySearch>['toggleSearch'];
    labelProps?: ComponentProps<typeof FuzzySearch>['labelProps'];
}

const QuickSearch = ({ toggleSearch, labelProps }: Props) => {
    const postHog = usePostHog();
    const isMobile = useIsMobile();

    const fuzzySearch = <FuzzySearch toggleSearch={toggleSearch} postHog={postHog} labelProps={labelProps} />;

    return isMobile ? (
        <>
            {fuzzySearch}
            <SearchWithPlanner />
        </>
    ) : (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {fuzzySearch}
            <Typography>or</Typography>
            <Box sx={{ minWidth: '25%' }}>
                <SearchWithPlanner />
            </Box>
        </Stack>
    );
};
export default QuickSearch;
