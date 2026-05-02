import { Divider, SxProps, Theme } from '@mui/material';
import { mergeSx } from '@mui/x-date-pickers/internals';
import { ReactNode } from 'react';

interface RightDividerProps {
    children: ReactNode;
    sx?: SxProps<Theme>;
}

export const RightDivider = ({ children, sx }: RightDividerProps) => {
    return (
        <Divider
            textAlign="left"
            sx={mergeSx(
                (theme) => ({
                    margin: 1,
                    '&::before': { width: 0 },
                    '&::after': { borderColor: theme.palette.text.primary },
                }),
                sx
            )}
        >
            {children}
        </Divider>
    );
};
