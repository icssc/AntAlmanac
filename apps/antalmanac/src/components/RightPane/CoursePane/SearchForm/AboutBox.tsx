import { ExpandMore } from '@mui/icons-material';
import {
    Typography,
    Card,
    CardMedia,
    CardContent,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from 'next/link';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FeedbackButton from '$components/buttons/Feedback';
import GitHubButton from '$components/buttons/GitHub';
import ProjectsButton from '$components/buttons/Projects';
import { setLocalStorageAboutBoxCollapseTime, setLocalStorageExpandAboutBox } from '$lib/localStorage';
import { useHelpMenuStore } from '$stores/HelpMenuStore';
import { useThemeStore } from '$stores/SettingsStore';

const images = [
    {
        src: '/about-box/aboutbox1.png',
        alt: '1. Enter a department or course name to search',
    },
    {
        src: '/about-box/aboutbox2.png',
        alt: '2. Add courses to your schedule',
    },
    {
        src: '/about-box/aboutbox3.png',
        alt: '3. Save your schedule and access from anywhere!',
    },
];

export function AboutBox() {
    const isDark = useThemeStore((store) => store.isDark);

    const [expandAboutBox, toggleExpandAboutBox] = useHelpMenuStore(
        useShallow((store) => [store.expandAboutBox, store.toggleExpandAboutBox])
    );

    const collapseAboutBox = useCallback(() => {
        setLocalStorageAboutBoxCollapseTime(Date.now().toString());
    }, []);

    const handleClick = useCallback(() => {
        if (expandAboutBox) {
            collapseAboutBox();
        }
        setLocalStorageExpandAboutBox(!expandAboutBox ? 'true' : 'false');
        toggleExpandAboutBox();
    }, [expandAboutBox, collapseAboutBox, toggleExpandAboutBox]);

    return (
        <Accordion
            variant="outlined"
            expanded={expandAboutBox}
            onChange={handleClick}
            sx={{
                padding: 1,
                paddingRight: 4, // FIX ME: Magic Number padding for the Help Menu
                marginBottom: '10px',
                marginRight: '5px',
            }}
        >
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography component="span" variant="h5" fontWeight={500}>
                    Using AntAlmanac Scheduler
                </Typography>
            </AccordionSummary>

            <AccordionDetails>
                <Stack gap={2}>
                    <Stack direction="row" gap={2}>
                        {images.map((image) => (
                            <Card key={image.src} elevation={0} sx={{ border: '1px solid #ccc' }}>
                                <CardMedia
                                    component="img"
                                    image={image.src}
                                    alt={image.alt}
                                    sx={{ width: '100%', height: 'auto' }}
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
                            <Link href="/planner">AntAlmanac Planner</Link>
                        </Typography>

                        <Stack direction="row" color={isDark ? 'white' : grey[600]}>
                            <ProjectsButton />
                            <GitHubButton />
                            <FeedbackButton />
                        </Stack>
                    </Stack>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
