import { useIsMobile } from "$hooks/useIsMobile";
import { Help } from "@mui/icons-material";
import { Box, Tooltip, Typography } from "@mui/material";

interface EnrollmentColumnHeaderProps {
    label: string;
}

export function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const isMobile = useIsMobile();

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
