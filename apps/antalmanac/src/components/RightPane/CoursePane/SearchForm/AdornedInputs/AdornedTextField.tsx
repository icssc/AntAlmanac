import { FormControlProps, InputLabel, Stack, TextField, TextFieldProps } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface AdornedTextFieldProps {
    label: string;
    textFieldProps?: TextFieldProps;
    formControlProps?: FormControlProps;
    isAligned?: boolean;
}

export const AdornedTextField = ({ label, textFieldProps, isAligned }: AdornedTextFieldProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <Stack direction="row" alignItems="center">
            <InputLabel
                shrink={false}
                htmlFor={textFieldProps?.id}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingY: 1,
                    paddingX: 1.5,
                    minWidth: isAligned ? '10.25rem' : '6rem',
                    maxWidth: 'fit-content',
                    backgroundColor: isDark ? grey[800] : grey[200],
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                    border: '1px solid #606060',
                    borderRightWidth: 0,
                }}
            >
                {label}
            </InputLabel>

            <TextField
                size="small"
                variant="outlined"
                {...textFieldProps}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? grey[500] : grey[600],
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 1,
                        },
                    },
                }}
                InputProps={{
                    sx: {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                    },
                }}
            />
        </Stack>
    );
};
