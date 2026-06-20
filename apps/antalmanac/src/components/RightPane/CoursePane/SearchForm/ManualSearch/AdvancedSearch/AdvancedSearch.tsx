import { AdvancedSearchFieldRow } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/AdvancedSearchFieldRow';
import { BuildingField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/BuildingField';
import { DaysField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/DaysField';
import { DivisionField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/DivisionField';
import { EndTimeField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/EndTimeField';
import { ExcludeRestrictionsField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/ExcludeRestrictionsField';
import { ExcludeRoadmapField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/ExcludeRoadmapField';
import { FullCoursesField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/FullCoursesField';
import { InstructorField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/InstructorField';
import { OnlineField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/OnlineField';
import { RoomField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/RoomField';
import { StartTimeField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/StartTimeField';
import { UnitsField } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/AdvancedSearchFields/UnitsField';
import { hasAdvancedParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readAdvancedSearchParams } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { useState } from 'react';

export function AdvancedSearch() {
    const [expanded, setExpanded] = useState(() => hasAdvancedParams(readAdvancedSearchParams()));
    const isDark = useIsDarkMode();

    const handleExpand = () => setExpanded((value) => !value);

    return (
        <>
            <Button
                onClick={handleExpand}
                color={isDark ? 'secondary' : 'primary'}
                sx={{
                    textTransform: 'none',
                    display: 'flex',
                    justifyContent: 'start',
                }}
            >
                <Typography noWrap>Advanced Search Options</Typography>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </Button>

            <Collapse in={expanded}>
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
