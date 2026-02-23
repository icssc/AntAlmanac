import { useThemeStore } from "$stores/SettingsStore";
import { Box, BoxProps } from "@mui/material";
import { grey } from "@mui/material/colors";

interface CustomInputBoxProps {
    children: React.ReactNode;
    boxProps?: BoxProps;
}

export const CustomInputBox = ({ children, boxProps }: CustomInputBoxProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box
            {...boxProps}
            flexGrow={1}
            sx={{
                "& .MuiOutlinedInput-root": {
                    minWidth: 100,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDark ? grey[500] : grey[600],
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 1,
                    },
                },
            }}
        >
            {children}
        </Box>
    );
};
