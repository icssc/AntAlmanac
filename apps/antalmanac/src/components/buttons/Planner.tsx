import { Route } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { PLANNER_LINK } from '$src/globals';

export const PlannerButton = () => {
    return (
        <Tooltip title="Check out AntAlmanac Planner!">
            <Button color="inherit" startIcon={<Route />} size="large" variant="text" href={PLANNER_LINK}>
                Go To Planner
            </Button>
        </Tooltip>
    );
};
