import { AdvancedSearchFieldRow } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/AdvancedSearchFieldRow';
import { BuildingField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/BuildingField';
import { CoursesFullField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/CoursesFullField';
import { DaysField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/DaysField';
import { DivisionField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/DivisionField';
import { EndTimeField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/EndTimeField';
import { ExcludeRestrictionsField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/ExcludeRestrictionsField';
import { ExcludeRoadmapField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/ExcludeRoadmapField';
import { InstructorField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/InstructorField';
import { OnlineField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/OnlineField';
import { RoomField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/RoomField';
import { StartTimeField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/StartTimeField';
import { UnitsField } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchFields/UnitsField';
import { hasAdvancedParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { readAdvancedSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/loaders';
import { useThemeStore } from '$stores/SettingsStore';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { useState } from 'react';

export function AdvancedSearch() {
    const [expanded, setExpanded] = useState(() => hasAdvancedParams(readAdvancedSearchParams()));
    const isDark = useThemeStore((store) => store.isDark);

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
                        <CoursesFullField />
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
