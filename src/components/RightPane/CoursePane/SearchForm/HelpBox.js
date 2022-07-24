import React from 'react';
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core';

const styles = {
    container: {
        padding: 12,
        marginBottom: '10px',
        marginRight: '5px',
    },
    list: {
        paddingLeft: '1.5em',
        fontSize: '1.5em',
    },
};

const HelpBox = (props) => {
    const { classes } = props;
    return (
        <Paper variant="outlined" className={classes.container}>
            <h2>Need help planning your schedule?</h2>
            <ol className={classes.list}>
                <li>
                    Go to the{' '}
                    <a href="https://catalogue.uci.edu/undergraduatedegrees/" target="_blank" rel="noopener noreferrer">
                        UCI Catalogue
                    </a>
                </li>
                <li>Select your major</li>
                <li>Click on the tabs for "REQUIREMENTS" and "SAMPLE PROGRAM" to see what classes you should take</li>
            </ol>
        </Paper>
    );
};

export default withStyles(styles)(HelpBox);
