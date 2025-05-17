import { Paper, Typography } from '@mui/material';

export function PrivacyPolicyBanner() {
    return (
        <Paper
            variant="outlined"
            sx={{
                padding: 1.5,
                paddingRight: 6, // FIX ME: Magic Number padding for the Help Menu
                marginBottom: 1,
                marginRight: 0.5,
                textWrap: 'pretty',
            }}
        >
            <Typography variant="body2">
                We use cookies to analyze website traffic and track usage, with the aim of improving your experience on
                AntAlmanac. By continuing to use this website, consent to our{' '}
                <a href={'https://github.com/icssc/AntAlmanac/blob/main/PRIVACY-POLICY.md'}>privacy policy</a>
            </Typography>
        </Paper>
    );
}
