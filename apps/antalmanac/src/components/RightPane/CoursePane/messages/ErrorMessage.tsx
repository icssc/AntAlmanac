import { Alert, Link, Stack, useTheme } from '@mui/material';

import darkNoNothing from '../static/dark-no_results.png';
import noNothing from '../static/no_results.png';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useThemeStore } from '$stores/SettingsStore';

export function ErrorMessage() {
    const theme = useTheme();
    const { isDark } = useThemeStore();

    const formData = RightPaneStore.getFormData();
    const deptValue = formData.deptValue.replace(' ', '').toUpperCase() || null;
    const courseNumber = formData.courseNumber.replace(/\s+/g, '').toUpperCase() || null;
    const courseId = deptValue && courseNumber ? `${deptValue}${courseNumber}` : null;

    return (
        <Stack
            sx={{
                alignItems: 'center',
            }}
        >
            {courseId ? (
                <Link href={`https://peterportal.org/course/${courseId}`} target="_blank" sx={{ width: '100%' }}>
                    <Alert
                        variant="filled"
                        severity="info"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 14,
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                        }}
                    >
                        <span>
                            Search for{' '}
                            <span style={{ textDecoration: 'underline' }}>
                                {deptValue} {courseNumber}
                            </span>{' '}
                            on PeterPortal!
                        </span>
                    </Alert>
                </Link>
            ) : null}

            <img
                src={isDark ? darkNoNothing : noNothing}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%', pointerEvents: 'none' }}
            />
        </Stack>
    );
}
