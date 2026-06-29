import { Box, type BoxProps, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';

interface CustomInputBoxProps {
    children: React.ReactNode;
    boxProps?: BoxProps;
}

export const CustomInputBox = ({ children, boxProps }: CustomInputBoxProps) => {
    const theme = useTheme();
    const secondaryColor = theme.vars.palette.secondary.main;
    return (
        <Box
            {...boxProps}
            flexGrow={1}
            minWidth={0}
            sx={(theme) => ({
                '& .MuiOutlinedInput-root': {
                    minWidth: 100,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                        borderColor: grey[600],
                        ...theme.applyStyles('dark', { borderColor: grey[500] }),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 1,
                        borderColor: secondaryColor,
                    },
                },
            })}
        >
            {children}
        </Box>
    );
};
