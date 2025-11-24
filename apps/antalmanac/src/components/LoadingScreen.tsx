import { Dialog, DialogContent, LinearProgress, Stack, Box } from '@mui/material';
import { useState, useEffect } from 'react';

import { Logo } from './Header/Logo';

import { BLUE } from '$src/globals';

const FUN_FACTS = [
    'Did you know? Antalmanac is maintained by the ICS Student Council at UCI!',
    'AntAlmanac was created in 2018 by a small group of students under the leadership of @the-rango.',
    'Did you know you can search for classes by pressing "CTRL/CMD" + clicking on your schedule item!',
    'Need a 4 year plan? Checkout PeterPortal!',
];
type LoadingScreenProps = {
    open: boolean;
};

export function LoadingScreen(props: LoadingScreenProps) {
    const [randomFact, setRandomFact] = useState<string>(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRandomFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
        }, 4000);

        return () => clearInterval(interval);
    }, []);
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
                <Stack spacing={10} width="100%" height="inherit" justifyContent="center" alignItems="center">
                    <Logo />
                    <Stack
                        spacing={2}
                        width="100%"
                        height="25%"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <LinearProgress sx={{ width: { default: '100%', md: '50%' } }} />
                        <Box fontStyle="italic" color="white" fontSize="h6.fontSize" sx={{ textAlign: 'center' }}>
                            {randomFact}
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
