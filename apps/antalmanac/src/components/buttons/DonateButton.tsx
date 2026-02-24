import { FavoriteRounded } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { DONATION_LINK } from '$src/globals';

export const DonateButton = () => {
    return (
        <Tooltip title="Help us pay for the servers!">
            <Button
                color="inherit"
                startIcon={<FavoriteRounded />}
                size="large"
                variant="text"
                href={DONATION_LINK}
                target="_blank"
            >
                Donate
            </Button>
        </Tooltip>
    );
};
