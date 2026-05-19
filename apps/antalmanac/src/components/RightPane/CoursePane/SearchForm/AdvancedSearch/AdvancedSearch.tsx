import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import { useCoursePaneUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { useThemeStore } from '$stores/SettingsStore';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';

export function AdvancedSearch() {
    const { advancedSearchEnabled, setAdvancedSearchEnabled } = useCoursePaneUrlState();
    const isDark = useThemeStore((store) => store.isDark);

    const handleExpand = () => {
        void setAdvancedSearchEnabled(!advancedSearchEnabled);
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
