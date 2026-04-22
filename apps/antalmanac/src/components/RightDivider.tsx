import { Divider, SxProps, Theme } from '@mui/material';
import { mergeSx } from '@mui/x-date-pickers/internals';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    sx?: SxProps<Theme>;
}

const RightDivider = ({ children, sx }: Props) => {
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
export default RightDivider;
