import { Paper, ImageList, ImageListItem, Typography, Link, List, ListItemText, ListItem } from '@mui/material';

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

function HelpBox() {
    return (
        <Paper variant="outlined" sx={{ padding: 2, marginBottom: '10px', marginRight: '5px' }}>
            <Typography variant="h5" fontWeight="bold">
                Need help planning your schedule?
            </Typography>

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
