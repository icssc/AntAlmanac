import { Paper, Typography, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { PureComponent } from 'react';

const styles = {
    container: {
        padding: 12,
        paddingRight: 48, // FIX ME: Magic Number padding for the Help Menu
        marginBottom: 8,
        marginRight: 4,
        textWrap: 'pretty',
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
