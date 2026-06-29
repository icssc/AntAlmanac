import { AdvancedSearchFieldRow } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/AdvancedSearchFieldRow';
import { BuildingField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/BuildingField';
import { DaysField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/DaysField';
import { DivisionField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/DivisionField';
import { ExcludeRestrictionsField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/ExcludeRestrictionsField';
import { ExcludeRoadmapField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/ExcludeRoadmapField';
import { FullCoursesField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/FullCoursesField';
import { InstructorField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/InstructorField';
import { OnlineField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/OnlineField';
import { RoomField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/RoomField';
import { UnitsField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/UnitsField';
import { hasAdvancedParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readAdvancedSearchParams } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, Collapse, Skeleton, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const StartTimeField = dynamic(
    () => import('./AdvancedSearchFields/StartTimeField').then((m) => ({ default: m.StartTimeField })),
    { ssr: false, loading: () => <Skeleton variant="rounded" width="100%" height={40} sx={{ flex: 1 }} /> }
);

const EndTimeField = dynamic(
    () => import('./AdvancedSearchFields/EndTimeField').then((m) => ({ default: m.EndTimeField })),
    { ssr: false, loading: () => <Skeleton variant="rounded" width="100%" height={40} sx={{ flex: 1 }} /> }
);

export function AdvancedSearch() {
    const [expanded, setExpanded] = useState(() => hasAdvancedParams(readAdvancedSearchParams()));

    const handleExpand = () => setExpanded((value) => !value);

    return (
        <>
            <Button
                onClick={handleExpand}
                color="primary"
                sx={(theme) => ({
                    textTransform: 'none',
                    display: 'flex',
                    justifyContent: 'start',
                    ...theme.applyStyles('dark', {
                        color: theme.vars.palette.secondary.main,
                    }),
                })}
            >
                <Typography noWrap>Advanced Search Options</Typography>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </Button>

            <Collapse in={expanded} mountOnEnter>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        marginBottom: '1rem',
                    }}
                >
                    <AdvancedSearchFieldRow>
                        <InstructorField />
                        <UnitsField />
                        <FullCoursesField />
                    </AdvancedSearchFieldRow>

                    <AdvancedSearchFieldRow>
                        <DivisionField />
                        <StartTimeField />
                        <EndTimeField />
                    </AdvancedSearchFieldRow>

                    <AdvancedSearchFieldRow>
                        <OnlineField />
                        <BuildingField />
                        <RoomField />
                    </AdvancedSearchFieldRow>

                    <AdvancedSearchFieldRow>
                        <ExcludeRoadmapField />
                        <ExcludeRestrictionsField />
                        <DaysField />
                    </AdvancedSearchFieldRow>
                </Box>
            </Collapse>
        </>
    );
}
