import React, { PureComponent } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core';

const styles = {
    container: {
        padding: 12,
        marginBottom: '10px',
        marginRight: '5px',
    },
};

class PrivacyPolicyBanner extends PureComponent {
    render() {
        return (
            <Paper variant="outlined" className={this.props.classes.container}>
                <Typography variant="body2">
                    We use cookies to analyze website traffic and track usage, with the aim of improving your experience
                    on AntAlmanac. By continuing to use this website, you are giving consent to store Google Analytics
                    cookies on your device.
                </Typography>
            </Paper>
        );
    }
}

export default withStyles(styles)(PrivacyPolicyBanner);
