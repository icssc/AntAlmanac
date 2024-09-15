import { Button } from '@mui/material';

import RainbowAnteater from '$assets/rainbow-anteater.png';

export function BrandIntegration({ isMobile }: { isMobile: boolean }) {
    return (
        <Button
            href="/"
            target="_blank"
            variant="outlined"
            color="secondary"
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: '0.3rem 1.5rem 0.3rem 0.3rem',
                color: 'inherit',
                textTransform: 'none',
                fontWeight: 'normal',
            }}
        >
            <img
                src={RainbowAnteater}
                alt="anteater in a rainbow sweater"
                style={{ height: '100%', borderRadius: '40%', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
            />
            <div style={{ fontSize: isMobile ? '1rem' : '1.5rem', marginLeft: 'auto', marginRight: 'auto' }}>
                Powered by AntAI
            </div>
        </Button>
    );
}
