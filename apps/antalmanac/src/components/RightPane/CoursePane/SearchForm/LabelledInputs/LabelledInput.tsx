import { Box, BoxProps } from '@mui/material';
import { grey } from '@mui/material/colors';

import { CustomInputLabel } from './CustomInputLabel';

import { useThemeStore } from '$stores/SettingsStore';

interface LabelledInputProps {
    label: string;
    children: React.ReactNode;
    wrapperProps?: BoxProps;
    id: string;
    isAligned?: boolean;
}

export const LabelledInput = ({ label, children, wrapperProps, id, isAligned }: LabelledInputProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <Box display="flex" alignItems="center" {...wrapperProps}>
            <CustomInputLabel label={label} id={id} isAligned={isAligned} />
            <Box
                sx={{
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                        minWidth: 100,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? grey[500] : grey[600],
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 1,
                        },
                    },
                }}
            >
                {children}
            </Box>
        </Box>
    );
};
