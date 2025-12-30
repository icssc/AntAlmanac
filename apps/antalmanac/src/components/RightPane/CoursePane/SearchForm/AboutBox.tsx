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

const images = [
    {
        src: '/helpbox1.png',
        title: 'Search',
        caption: 'Enter a department or course name to search.',
        alt: 'Search Box image',
    },
    {
        src: '/helpbox2.png',
        title: 'Add',
        caption: 'Add courses to your schedule.',
        alt: 'Add Course image',
    },
    {
        src: '/helpbox3.png',
        title: 'Save',
        caption: 'Save your schedule and access from anywhere!',
        alt: 'Save Schedule image',
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
        <Paper variant="outlined" sx={{ padding: 3, marginBottom: '10px', marginRight: '5px' }}>
            <Stack gap={2}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                    }}
                >
                    <Box>
                        <Typography variant="h5" style={{ fontWeight: 500 }} gutterBottom>
                            Using AntAlmanac Scheduler
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClick} size="small" sx={{ mt: -1 }}>
                        <Close />
                    </IconButton>
                </Box>
                <Stack direction="row" gap={2}>
                    {images.map((image) => (
                        <Card
                            sx={{
                                border: '1px solid #ccc',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                            elevation={0}
                            key={image.src}
                        >
                            <CardMedia
                                component="img"
                                image={image.src}
                                alt={image.alt}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <CardContent>
                                <Typography variant="h6" color="text.primary" sx={{ marginBottom: '5px' }}>
                                    {image.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {image.caption}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
                <Stack gap={1}>
                    <Typography variant="body1">
                        Need help <i>discovering</i> courses? Check out{' '}
                        <Link style={{ color: isDark ? 'white' : grey[700] }} href={'/planner'}>
                            AntAlmanac Planner
                        </Link>
                        .
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
