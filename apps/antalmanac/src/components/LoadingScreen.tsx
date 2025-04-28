import { Dialog, DialogContent, LinearProgress } from '@mui/material';

import { Logo } from './Header/Logo';

import { BLUE } from '$src/globals';

type LoadingScreenProps = {
    open: boolean;
};
export function LoadingScreen(props: LoadingScreenProps) {
    return (
        <Dialog fullScreen open={props.open}>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    backgroundColor: BLUE,
                }}
            >
                <Logo />
                <LinearProgress sx={{ width: '25%', marginTop: 2 }} />
            </DialogContent>
        </Dialog>
    );
}
