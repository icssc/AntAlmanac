import { Paper, Typography } from '@mui/material';

export function PrivacyPolicyBanner() {
    return (
        <Paper
            variant="outlined"
            sx={{
                padding: 12,
                paddingRight: 48, // FIX ME: Magic Number padding for the Help Menu
                marginBottom: 8,
                marginRight: 4,
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
