import * as React from 'react';
import { Box, Button, Grid, Fade, Paper, Popper, Typography, type PopperPlacementType } from '@mui/material';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import trpc from '$lib/api/trpc';

export function Login() {
    const utils = trpc.useUtils();

    const query = trpc.auth.status.useQuery();

    const onSuccess = useCallback((credentialResponse: CredentialResponse) => {
        console.log(credentialResponse);

        document.cookie = `access_token=${credentialResponse.credential}; path=/`;

        utils.auth.invalidate();
    }, []);

    const onError = useCallback(() => {
        console.log('Login Failed');
    }, []);

    return query.data?.email ? <div>LOGGED IN</div> : <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

export function PositionedPopper() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = React.useState(false);
    const [placement, setPlacement] = React.useState<PopperPlacementType>();

    const handleClick = (newPlacement: PopperPlacementType) => (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => placement !== newPlacement || !prev);
        setPlacement(newPlacement);
    };

    return (
        <Box sx={{ width: 500 }}>
            <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper>
                            <Typography sx={{ p: 2 }}>The content of the Popper.</Typography>
                        </Paper>
                    </Fade>
                )}
            </Popper>
            <Grid container justifyContent="center">
                <Grid item>
                    <Button onClick={handleClick('top-start')}>top-start</Button>
                    <Button onClick={handleClick('top')}>top</Button>
                    <Button onClick={handleClick('top-end')}>top-end</Button>
                </Grid>
            </Grid>
            <Grid container justifyContent="center">
                <Grid item xs={6}>
                    <Button onClick={handleClick('left-start')}>left-start</Button>
                    <br />
                    <Button onClick={handleClick('left')}>left</Button>
                    <br />
                    <Button onClick={handleClick('left-end')}>left-end</Button>
                </Grid>
                <Grid item container xs={6} alignItems="flex-end" direction="column">
                    <Grid item>
                        <Button onClick={handleClick('right-start')}>right-start</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={handleClick('right')}>right</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={handleClick('right-end')}>right-end</Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container justifyContent="center">
                <Grid item>
                    <Button onClick={handleClick('bottom-start')}>bottom-start</Button>
                    <Button onClick={handleClick('bottom')}>bottom</Button>
                    <Button onClick={handleClick('bottom-end')}>bottom-end</Button>
                </Grid>
            </Grid>
        </Box>
    );
}
