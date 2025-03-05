import { Help } from '@material-ui/icons';
import { Box, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';

interface EnrollmentColumnHeaderProps {
    label: string;
}

export function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box display="flex">
            {props.label}
            {!isMobile && (
                <Tooltip
                    title={
                        <Typography>
                            Enrolled/Capacity
                            <br />
                            Waitlist/Capacity
                            <br />
                            New-Only Reserved
                        </Typography>
                    }
                >
                    <Help fontSize="small" />
                </Tooltip>
            )}
        </Box>
    );
}
