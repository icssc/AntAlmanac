import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useTimeFormatStore } from '$stores/SettingsStore';

export function TimeSelector() {
    const theme = useTheme();
    const accentColor = theme.palette.secondary.main;
    const segment = theme.palette.settingsSegment;

    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore((store) => [store.isMilitaryTime, store.setTimeFormat]);

    const borderColor = theme.palette.divider;
    const inactiveHoverBackgroundColor = segment.hoverBackground;

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLDivElement>) => {
        const value = event.currentTarget.getAttribute('data-value');
        setTimeFormat(value === 'true');
    };

    const getSegmentSx = (selected: boolean, position: 'left' | 'right') => ({
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        backgroundColor: selected ? theme.palette.primary.main : segment.background,
        color: selected ? theme.palette.primary.contrastText : accentColor,
        ...(position === 'left' ? { borderRight: `1px solid ${borderColor}` } : null),
        ...(position === 'left' ? { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 } : null),
        ...(position === 'right' ? { borderTopRightRadius: 4, borderBottomRightRadius: 4 } : null),
        '&:hover': {
            backgroundColor: selected ? theme.palette.primary.main : inactiveHoverBackgroundColor,
        },
    });

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Time
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                }}
            >
                <Box data-value="false" onClick={handleTimeFormatChange} sx={getSegmentSx(!isMilitaryTime, 'left')}>
                    12 Hour
                </Box>
                <Box data-value="true" onClick={handleTimeFormatChange} sx={getSegmentSx(isMilitaryTime, 'right')}>
                    24 Hour
                </Box>
            </Box>
        </Box>
    );
}
