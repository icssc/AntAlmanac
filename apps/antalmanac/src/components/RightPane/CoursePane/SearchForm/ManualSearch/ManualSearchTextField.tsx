import { FormControl, FormControlProps, TextField, TextFieldProps } from '@mui/material';

import { ManualSearchInputAdornment } from './ManualSearchInputAdornment';

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
                    sx: { paddingRight: 1 },
                }}
            />
        </FormControl>
    );
};
