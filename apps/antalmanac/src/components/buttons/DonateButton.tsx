import { DONATION_LINK } from "$src/globals";
import { FavoriteRounded } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";

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
