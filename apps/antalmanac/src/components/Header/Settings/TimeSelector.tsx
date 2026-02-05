import { Box, Typography } from '@mui/material';

import { BLUE, LIGHT_BLUE } from '$src/globals';
import { useTimeFormatStore, useThemeStore } from '$stores/SettingsStore';

export function TimeSelector() {
    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore((store) => [store.isMilitaryTime, store.setTimeFormat]);
    const isDark = useThemeStore((store) => store.isDark);
    const accentColor = isDark ? LIGHT_BLUE : BLUE;

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLDivElement>) => {
        const value = event.currentTarget.getAttribute('data-value');
        setTimeFormat(value === 'true');
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Time
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    border: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                    borderRadius: '4px',
                }}
            >
                <Box
                    data-value="false"
                    onClick={handleTimeFormatChange}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        backgroundColor: !isMilitaryTime ? accentColor : isDark ? '#333333' : '#f8f9fa',
                        color: !isMilitaryTime ? '#fff' : accentColor,
                        borderRight: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                        '&:hover': {
                            backgroundColor: !isMilitaryTime ? accentColor : isDark ? '#424649' : '#d3d4d5',
                        },
                    }}
                >
                    12 Hour
                </Box>
                <Box
                    data-value="true"
                    onClick={handleTimeFormatChange}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        backgroundColor: isMilitaryTime ? accentColor : isDark ? '#333333' : '#f8f9fa',
                        color: isMilitaryTime ? '#fff' : accentColor,
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                        '&:hover': {
                            backgroundColor: isMilitaryTime ? accentColor : isDark ? '#424649' : '#d3d4d5',
                        },
                    }}
                >
                    24 Hour
                </Box>
            </Box>
        </Box>
    );
}
