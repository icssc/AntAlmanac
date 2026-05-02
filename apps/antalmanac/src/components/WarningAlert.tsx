import { Alert } from '@mui/material';
import { ReactNode, useState } from 'react';

interface WarningAlertProps {
    children: ReactNode;
    closable?: boolean;
    onClose?: () => void;
}

export const WarningAlert = ({ children, closable = false, onClose }: WarningAlertProps) => {
    const [doShow, setDoShow] = useState(true);

    const handleClose = () => {
        onClose?.();
        setDoShow(false);
    };

    return doShow ? (
        <Alert
            severity="warning"
            onClose={closable ? handleClose : undefined}
            sx={{
                mb: 1,
                '& .MuiAlert-message': {
                    display: 'flex',
                    alignItems: 'center',
                },
            }}
        >
            {children}
        </Alert>
    ) : null;
};
