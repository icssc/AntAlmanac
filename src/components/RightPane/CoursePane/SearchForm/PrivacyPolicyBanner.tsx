import { Paper, Typography } from '@mui/material';
import { withStyles, ClassNameMap } from '@mui/styles';
import React, { PureComponent } from 'react';

const styles = {
    container: {
        padding: 12,
        marginBottom: '10px',
        marginRight: '5px',
    },
};

interface PrivacyPolicyBannerProps {
    classes: ClassNameMap;
}

class PrivacyPolicyBanner extends PureComponent<PrivacyPolicyBannerProps> {
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
