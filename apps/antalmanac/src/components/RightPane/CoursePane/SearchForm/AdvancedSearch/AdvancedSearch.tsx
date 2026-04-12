import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';

import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';

export function AdvancedSearch() {
    const { advancedSearchEnabled, toggleAdvancedSearch } = useCoursePaneStore();
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <>
            <Button
                onClick={toggleAdvancedSearch}
                color={isDark ? 'secondary' : 'primary'}
                sx={{
                    textTransform: 'none',
                    display: 'flex',
                    justifyContent: 'start',
                }}
            >
                <Typography noWrap>Advanced Search Options</Typography>
                {advancedSearchEnabled ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Collapse in={advancedSearchEnabled}>
                <AdvancedSearchTextFields />
            </Collapse>
        </>
    );
}
