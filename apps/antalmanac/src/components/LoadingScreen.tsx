import { Dialog, DialogContent, LinearProgress, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

import { Logo } from './Header/Logo';

import { BLUE } from '$src/globals';

type LoadingScreenProps = {
    open: boolean;
};
export function LoadingScreen(props: LoadingScreenProps) {
    const funFacts = useRef<string[]>([
        'Did you know? Antalmanac is maintained by the ICS Student Council at UCI!',
        'AntAlmanac was created in 2018 by a small group of students under the leadership of @the-rango.',
        'Did you know you can search for classes by pressing "CTRL/CMD" + clicking on your schedule item!',
        'I 💖 Kevin Wu',
        'Need a 4 year plan? Checkout PeterPortal!',
    ]).current;
    const [randomFact, setRandomFact] = useState<string>(funFacts[Math.floor(Math.random() * funFacts.length)]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRandomFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
        }, 5000);

        return () => clearInterval(interval);
    }, [funFacts]);
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
                <Stack spacing={5} width="100%" alignItems="center">
                    <Logo />
                    <LinearProgress sx={{ width: '25%', marginTop: 2 }} />
                    <Box fontStyle="italic" color="white" fontSize="h6.fontSize">
                        {randomFact}
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
