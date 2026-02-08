import { AccessTimeFilled } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';

import { useIsMobile } from '$hooks/useIsMobile';

interface EnrollmentColumnHeaderProps {
    label: string;
    formattedTime: string | null;
}

export function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const isMobile = useIsMobile();

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
