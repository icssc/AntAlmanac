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
        <Box display="flex">
            {!isMobile && props.formattedTime && (
                <Tooltip title={<Typography> Last updated at {props.formattedTime}</Typography>}>
                    <AccessTimeFilled fontSize="small"/>
                </Tooltip>
            )}
            {props.label} 
        </Box>
    );
}
