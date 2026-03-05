import { Close } from '@mui/icons-material';
import {
    Paper,
    ImageList,
    ImageListItem,
    Typography,
    Link,
    List,
    ListItemText,
    ListItem,
    Box,
    IconButton,
} from '@mui/material';
import Image from 'next/image';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { setLocalStorageHelpBoxDismissalTime } from '$lib/localStorage';
import { useHelpMenuStore } from '$stores/HelpMenuStore';

const images = [
    {
        src: '/helpbox1.png',
        alt: 'UCI General Catalogue with "Explore Undergraduate Programs" button highlighted',
    },
    {
        src: '/helpbox2.png',
        alt: 'Undergraduate Majors and Minors page with catalogue highlighted',
    },
    {
        src: '/helpbox3.png',
        alt: 'Electrical Engineering page with "REQUIREMENTS" and "SAMPLE PROGRAM" tabs highlighted',
    },
];

export function HelpBox() {
    const [showHelpBox, setShowHelpBox] = useHelpMenuStore(
        useShallow((store) => [store.showHelpBox, store.setShowHelpBox])
    );

    const dismissHelpBox = useCallback(() => {
        setLocalStorageHelpBoxDismissalTime(Date.now().toString());
    }, []);

    const handleClick = useCallback(() => {
        setShowHelpBox(false);
        dismissHelpBox();
    }, [dismissHelpBox, setShowHelpBox]);

    if (!showHelpBox) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ padding: 2, marginRight: '5px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    Need help planning your schedule?
                </Typography>
                <IconButton aria-label="close" size="large" color="inherit" onClick={handleClick}>
                    <Close fontSize="inherit" />
                </IconButton>
            </Box>

            <List component="ol" sx={{ listStyle: 'decimal', pl: 2, pb: 0 }}>
                <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText>
                        Browse undergraduate majors on the{' '}
                        <Link
                            href="https://catalogue.uci.edu/undergraduatedegrees/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            UCI Catalogue
                        </Link>
                        .
                    </ListItemText>
                </ListItem>

                <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText>Select your major.</ListItemText>
                </ListItem>

                <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText>
                        View the &quot;REQUIREMENTS&quot; and &quot;SAMPLE PROGRAM&quot; tabs to see what classes you
                        should take.
                    </ListItemText>
                </ListItem>
            </List>
            <ImageList gap={10} cols={3}>
                {images.map((image) => (
                    <ImageListItem key={image.src}>
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={500}
                            height={300}
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Paper>
    );
}
