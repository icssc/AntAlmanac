import { AccessTimeFilled } from '@mui/icons-material';
import { Box, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';

interface EnrollmentColumnHeaderProps {
    label: string;
    formattedTime: string | null;
}

export function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box display="flex" alignItems="center">
            {props.label} 
            {!isMobile && props.formattedTime && (
                <Tooltip title={<Typography fontSize={'small'}> Last updated at {props.formattedTime}</Typography>}>
                    <AccessTimeFilled sx={{ fontSize:"1rem", marginBottom:0.25}}/>
                </Tooltip>
            )}
        </Box>
    );
}
