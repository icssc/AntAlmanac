import { useTimeFormatStore } from '$stores/SettingsStore';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

export function TimeSelector() {
    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore(
        useShallow((store) => [store.isMilitaryTime, store.setTimeFormat])
    );

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLDivElement>) => {
        const value = event.currentTarget.getAttribute('data-value');
        setTimeFormat(value === 'true');
    };

    const getSegmentSx =
        (selected: boolean, position: 'left' | 'right'): SxProps<Theme> =>
        (theme) => ({
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            backgroundColor: selected ? theme.vars.palette.primary.main : theme.vars.palette.settingsSegment.background,
            color: selected ? theme.vars.palette.primary.contrastText : theme.vars.palette.secondary.main,
            ...(position === 'left' ? { borderRight: 1, borderColor: theme.vars.palette.divider } : null),
            ...(position === 'left' ? { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 } : null),
            ...(position === 'right' ? { borderTopRightRadius: 4, borderBottomRightRadius: 4 } : null),
            '&:hover': {
                backgroundColor: selected
                    ? theme.vars.palette.primary.main
                    : theme.vars.palette.settingsSegment.hoverBackground,
            },
        });

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Time
            </Typography>
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    border: 1,
                    borderColor: theme.vars.palette.divider,
                    borderRadius: '4px',
                })}
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
