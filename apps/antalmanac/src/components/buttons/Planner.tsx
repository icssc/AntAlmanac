import { Route } from '@mui/icons-material';
import { Button, SxProps, Tooltip } from '@mui/material';

import { PLANNER_LINK } from '$src/globals';

interface PlannerButtonProps {
    buttonSx?: SxProps;
}

export const PlannerButton = ({ buttonSx }: PlannerButtonProps) => {
    return (
        <Tooltip title="Check out AntAlmanac Planner!">
            <Button color="inherit" startIcon={<Route />} size="large" variant="text" href={PLANNER_LINK} sx={buttonSx}>
                Go To Planner
            </Button>
        </Tooltip>
    );
};
