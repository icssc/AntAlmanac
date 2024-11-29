import { Close as CloseIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { MouseEventHandler } from 'react';
// Making a Custom MUI Close Button for the Tour Component
export const CloseButton = ({
    onClick,
    disabled,
    ...props
}: {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}) => {
    return (
        <IconButton
            aria-label="Close Tour"
            disabled={disabled}
            onClick={onClick}
            {...props}
            sx={{
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3px',
                backgroundColor: '#007bff',
                cursor: 'pointer',
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '35px',
                height: '35px',
                transition: 'background 0.3s, opacity 0.3s',
                '&:hover': {
                    backgroundColor: '#0056b3',
                },
            }}
        >
            <CloseIcon
                sx={{
                    height: '20px',
                    width: '20px',
                    color: 'white',
                    '&:hover': {
                        color: '#d3d3d3',
                    },
                }}
            />
        </IconButton>
    );
};
