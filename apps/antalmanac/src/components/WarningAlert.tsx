import { Alert } from '@mui/material';
import { type ReactNode, useState } from 'react';

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
            sx={{ paddingX: 1.25, paddingY: 0.5, alignItems: 'center', mb: 1 }}
            slotProps={{
                message: {
                    sx: {
                        padding: 0,
                    },
                },
                icon: {
                    sx: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '18px',
                        pr: 0,
                        mr: 1,
                    },
                },
            }}
        >
            {children}
        </Alert>
    ) : null;
};
