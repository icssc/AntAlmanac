import { Typography } from '@mui/material';

interface ToolbarUnitsBadgeProps {
    units: number;
}

export function ToolbarUnitsBadge({ units }: ToolbarUnitsBadgeProps) {
    return (
        <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
            {units} Units
        </Typography>
    );
}
