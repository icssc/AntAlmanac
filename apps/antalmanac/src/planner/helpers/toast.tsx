import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Snackbar, SnackbarContent } from '@mui/material';
import Slide from '@mui/material/Slide';
import { type FC, Fragment, type JSX } from 'react';

import ClickableDiv from '../component/ClickableDiv/ClickableDiv';

export type ToastSeverity = 'error' | 'success' | 'info';

interface ToastProps {
    text: string;
    severity: ToastSeverity;
    showToast: boolean;
    onClose: () => void;
    onClick?: () => void;
}

const iconSx = {
    mx: '8px',
    fontSize: 20,
};

const iconMap: Record<ToastSeverity, () => JSX.Element> = {
    success: () => <CheckCircleIcon sx={iconSx} />,
    error: () => <ErrorIcon sx={iconSx} />,
    info: () => <InfoIcon sx={iconSx} />,
};

const Toast: FC<ToastProps> = ({ text, severity, showToast, onClose, onClick }) => {
    let backgroundColor;
    switch (severity) {
        case 'error':
            backgroundColor = 'var(--planner-palette-error-main)';
            break;
        case 'success':
            backgroundColor = 'var(--planner-palette-success-main)';
            break;
        default:
            backgroundColor = 'var(--planner-palette-primary-main)';
    }

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={showToast}
            autoHideDuration={3000}
            onClose={onClose}
            slots={{ transition: Slide }}
            slotProps={{
                transition: {
                    direction: 'left',
                },
            }}
        >
            <SnackbarContent
                message={
                    <ClickableDiv onClick={onClick}>
                        {iconMap[severity]()}
                        {text}
                    </ClickableDiv>
                }
                sx={{
                    backgroundColor,
                    color: 'white',
                    boxShadow:
                        '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
                }}
                action={
                    <Fragment>
                        <IconButton color="inherit" onClick={onClose}>
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Fragment>
                }
            />
        </Snackbar>
    );
};

export default Toast;
