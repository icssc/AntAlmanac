import { Box, BoxProps } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useSecondaryColor } from '$hooks/useSecondaryColor';
import { useThemeStore } from '$stores/SettingsStore';

interface CustomInputBoxProps {
    children: React.ReactNode;
    boxProps?: BoxProps;
}

export const CustomInputBox = ({ children, boxProps }: CustomInputBoxProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    const secondaryColor = useSecondaryColor();
    return (
        <Box
            {...boxProps}
            flexGrow={1}
            sx={{
                '& .MuiOutlinedInput-root': {
                    minWidth: 100,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? grey[500] : grey[600],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 1,
                        borderColor: secondaryColor,
                    },
                },
            }}
        >
            {children}
        </Box>
    );
};
