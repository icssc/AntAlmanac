import { Paper, Typography, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { PureComponent } from 'react';

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
                    on AntAlmanac. By continuing to use this website, consent to our{' '}
                    <a href={'https://github.com/icssc/AntAlmanac/blob/main/PRIVACY-POLICY.md'}>privacy policy</a>
                </Typography>
            </Paper>
        );
    }
}

export default withStyles(styles)(PrivacyPolicyBanner);
