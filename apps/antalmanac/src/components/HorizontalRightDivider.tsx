import { mergeSx } from '$lib/helpers';
import { Divider, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface HorizontalRightDividerProps {
    children: ReactNode;
    sx?: SxProps<Theme>;
}

export const HorizontalRightDivider = ({ children, sx }: HorizontalRightDividerProps) => {
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
