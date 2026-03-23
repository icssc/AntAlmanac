import { FC, Fragment } from 'react';
import { Snackbar, SnackbarContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import Slide from '@mui/material/Slide';

export type ToastSeverity = 'error' | 'success' | 'info';

interface ToastProps {
  text: string;
  severity: ToastSeverity;
  showToast: boolean;
  onClose: () => void;
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

const Toast: FC<ToastProps> = ({ text, severity, showToast, onClose }) => {
  let backgroundColor;
  switch (severity) {
    case 'error':
      backgroundColor = 'var(--mui-palette-error-main)';
      break;
    case 'success':
      backgroundColor = 'var(--mui-palette-success-main)';
      break;
    default:
      backgroundColor = 'var(--mui-palette-primary-main)';
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
          <>
            {iconMap[severity]()}
            {text}
          </>
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
