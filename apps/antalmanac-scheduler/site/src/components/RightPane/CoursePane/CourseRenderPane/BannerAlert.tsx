import { BLUE } from '$src/globals';
import { Alert } from '@mui/material';

type BannerAlertProps = {
    children: React.ReactNode;
};

export function BannerAlert({ children }: BannerAlertProps) {
    return (
        <Alert
            variant="filled"
            severity="info"
            sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 14,
                backgroundColor: BLUE,
                color: 'white',
                width: '100%',
            }}
        >
            <span>{children}</span>
        </Alert>
    );
}
