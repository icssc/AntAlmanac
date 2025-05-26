import { FormControl, FormControlProps, TextField, TextFieldProps } from '@mui/material';
import { grey } from '@mui/material/colors';

import { ManualSearchInputAdornment } from './ManualSearchInputAdornment';

import { BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

interface ManualSearchTextFieldProps {
    label: string;
    textFieldProps?: TextFieldProps;
    autocompleteProps?: TextFieldProps;
    formControlProps?: FormControlProps;
    helperText?: string;
    fullWidth?: boolean;
}

export const ManualSearchTextField = ({
    label,
    textFieldProps,
    autocompleteProps,
    formControlProps,
    helperText,
    fullWidth,
}: ManualSearchTextFieldProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <FormControl variant="outlined" fullWidth={fullWidth} sx={{ minWidth: 200 }} {...formControlProps}>
            <TextField
                fullWidth={fullWidth}
                size="small"
                variant="outlined"
                placeholder={helperText}
                {...textFieldProps}
                InputProps={{
                    ...autocompleteProps?.InputProps,
                    sx: { paddingX: 0 },
                    startAdornment: <ManualSearchInputAdornment label={label} />,
                }}
                inputProps={{
                    ...autocompleteProps?.inputProps,
                    sx: {
                        paddingX: 1,
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? grey[400] : grey[600],
                    },
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: isDark ? BLUE : undefined,
                            borderWidth: 1,
                        },
                    },
                }}
            />
        </FormControl>
    );
};
