import { Paper, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ImageList, ImageListItem, Typography } from '@mui/material';

const styles = {
    container: {
        padding: 12,
        marginBottom: '10px',
        marginRight: '5px',
    },
};

interface HelpBoxProps {
    classes: ClassNameMap;
}

const HelpBox = ({ classes }: HelpBoxProps) => {
    return (
        <Paper variant="outlined" className={classes.container}>
            <Typography variant="h5" fontWeight={'bold'}>
                Need help planning your schedule?
            </Typography>
            <Typography>
                <ol>
                    <li>
                        Browse undergraduate majors on the{' '}
                        <a
                            href="https://catalogue.uci.edu/undergraduatedegrees/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            UCI Catalogue
                        </a>
                        .
                    </li>
                    <li>Select your major.</li>
                    <li>
                        View the &quot;REQUIREMENTS&quot; and &quot;SAMPLE PROGRAM&quot; tabs to see what classes you
                        should take.
                    </li>
                </ol>
            </Typography>
            <ImageList cols={3}>
                <ImageListItem>
                    <img
                        src="/helpbox1.png"
                        alt='UCI General Catalogue with "Explore Undergraduate Programs" button highlighted'
                    />
                </ImageListItem>
                <ImageListItem>
                    <img src="/helpbox2.png" alt="Undergraduate Majors and Minors page" />
                </ImageListItem>
                <ImageListItem>
                    <img
                        src="/helpbox3.png"
                        alt='Electrical Engineering page with "REQUIREMENTS" and "SAMPLE PROGRAM" tabs highlighted'
                    />
                </ImageListItem>
            </ImageList>
        </Paper>
    );
};

export default withStyles(styles)(HelpBox);
