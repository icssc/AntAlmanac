import { Close } from '@mui/icons-material';
import { Paper, Typography, Box, IconButton, Card, CardMedia, CardContent, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from 'next/link';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FeedbackButton from '$components/buttons/Feedback';
import GitHubButton from '$components/buttons/GitHub';
import ProjectsButton from '$components/buttons/Projects';
import { setLocalStorageAboutBoxDismissalTime } from '$lib/localStorage';
import { useHelpMenuStore } from '$stores/HelpMenuStore';
import { useThemeStore } from '$stores/SettingsStore';

// TODO: Replace helpbox images
const images = [
    {
        src: '/helpbox1.png',
        alt: '1. Enter a department or course name to search',
    },
    {
        src: '/helpbox2.png',
        alt: '2. Add courses to your schedule',
    },
    {
        src: '/helpbox3.png',
        alt: '3. Save your schedule and access from anywhere!',
    },
];

export function AboutBox() {
    const isDark = useThemeStore((store) => store.isDark);

    const [showAboutBox, setShowAboutBox] = useHelpMenuStore(
        useShallow((store) => [store.showAboutBox, store.setShowAboutBox])
    );

    const dismissAboutBox = useCallback(() => {
        setLocalStorageAboutBoxDismissalTime(Date.now().toString());
    }, []);

    const handleClick = useCallback(() => {
        setShowAboutBox(false);
        dismissAboutBox();
    }, [dismissAboutBox, setShowAboutBox]);

    if (!showAboutBox) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ padding: 2, marginBottom: '10px', marginRight: '5px' }}>
            <Stack gap={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">
                        About AntAlmanac Scheduler
                    </Typography>
                    <IconButton aria-label="close" size="large" color="inherit" onClick={handleClick}>
                        <Close fontSize="inherit" />
                    </IconButton>
                </Box>
                <Stack direction="row" gap={2}>
                    {images.map((image) => (
                        <Card sx={{ border: '1px solid #ccc' }} elevation={0} key={image.src}>
                            <CardMedia
                                component="img"
                                image={image.src}
                                alt={image.alt}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <CardContent>
                                <Typography variant="body1" fontWeight="bold">
                                    {image.alt}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
                <Stack gap={1}>
                    <Typography variant="body1">
                        Need help <i>discovering</i> courses? Check out{' '}
                        <Link href={'/planner'}>AntAlmanac Planner</Link>
                    </Typography>

                    <Stack direction="row" color={isDark ? 'white' : grey[600]}>
                        <ProjectsButton />
                        <GitHubButton />
                        <FeedbackButton />
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}
