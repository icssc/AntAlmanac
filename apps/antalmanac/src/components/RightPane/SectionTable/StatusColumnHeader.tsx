import { AccessTimeFilled } from "@mui/icons-material";
import { Box, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";

interface StatusColumnHeaderProps {
    label: string;
    formattedTime: string | null;
}

export function StatusColumnHeader({ label, formattedTime } : StatusColumnHeaderProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box display="flex" alignItems="center">
            {label} 
            {!isMobile && formattedTime && (
                <Tooltip title={<Typography> Last updated at {formattedTime}</Typography>}>
                    <AccessTimeFilled fontSize="small" sx={{ ml: 0.5 }}/>
                </Tooltip>
            )}
        </Box>
    )
}