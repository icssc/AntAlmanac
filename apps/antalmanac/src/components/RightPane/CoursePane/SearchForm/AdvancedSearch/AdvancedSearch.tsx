import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

export function AdvancedSearch() {
    const { advancedSearchEnabled, toggleAdvancedSearch } = useCoursePaneStore(
        useShallow((store) => ({
            advancedSearchEnabled: store.advancedSearchEnabled,
            toggleAdvancedSearch: store.toggleAdvancedSearch,
        }))
    );
    const isDark = useThemeStore((store) => store.isDark);

    const handleExpand = () => {
        toggleAdvancedSearch();
    };

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
                {advancedSearchEnabled ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Collapse in={advancedSearchEnabled}>
                <AdvancedSearchTextFields />
            </Collapse>
        </>
    );
}
