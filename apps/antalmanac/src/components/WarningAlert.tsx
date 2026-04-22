import { Alert } from '@mui/material';
import { ReactNode, useState } from 'react';

interface Props {
    children: ReactNode;
    closable?: boolean;
}

const WarningAlert = ({ children, closable = false }: Props) => {
    const [doShow, setDoShow] = useState(true);

    const handleClose = () => {
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
export default WarningAlert;
