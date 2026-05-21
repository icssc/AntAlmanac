import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import { hasAdvancedParams, useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { useThemeStore } from '$stores/SettingsStore';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';
import { useState } from 'react';

export function AdvancedSearch() {
    const { formData } = useCourseSearchUrlState();
    const [expanded, setExpanded] = useState(() => hasAdvancedParams(formData));
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <>
            <Button
                onClick={() => setExpanded((value) => !value)}
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
                <AdvancedSearchTextFields />
            </Collapse>
        </>
    );
}
