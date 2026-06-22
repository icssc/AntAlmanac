'use client';

import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * Deferred so the banner does not become the LCP element while the client shell hydrates.
 */
export function PrivacyPolicyBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showBanner = () => setVisible(true);

        if (typeof window.requestIdleCallback === 'function') {
            const idleId = window.requestIdleCallback(showBanner, { timeout: 2_000 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = window.setTimeout(showBanner, 1);
        return () => window.clearTimeout(timeoutId);
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                padding: 1.5,
                textWrap: 'pretty',
            }}
        >
            <Typography variant="body2">
                We use cookies to analyze website traffic and track usage, with the aim of improving your experience on
                AntAlmanac. By continuing to use this website, you consent to our{' '}
                <a href={'https://github.com/icssc/AntAlmanac/blob/main/PRIVACY-POLICY.md'}>privacy policy</a>.
            </Typography>
        </Paper>
    );
}
