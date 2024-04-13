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

interface HelpBoxProps {
    onDismiss: () => void;
}

function HelpBox({ onDismiss }: HelpBoxProps) {
    return (
        <Paper variant="outlined" sx={{ padding: 2, marginBottom: '10px', marginRight: '5px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    Need help planning your schedule?
                </Typography>
                <IconButton aria-label="close" size="large" color="inherit" onClick={onDismiss}>
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
                        <img src={image.src} alt={image.alt} />
                    </ImageListItem>
                ))}
            </ImageList>
        </Paper>
    );
}

export default HelpBox;
