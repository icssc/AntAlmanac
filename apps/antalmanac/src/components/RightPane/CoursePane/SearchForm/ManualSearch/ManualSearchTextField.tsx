import { FormControl, TextField, TextFieldProps } from '@mui/material';

import { ManualSearchInputAdornment } from './ManualSearchInputAdornment';

interface ManualSearchTextFieldProps {
    label: string;
    inputProps?: TextFieldProps;
    helperText?: string;
}

export const ManualSearchTextField = ({ label, inputProps, helperText }: ManualSearchTextFieldProps) => {
    return (
        <FormControl variant="outlined">
            <TextField
                size="small"
                variant="outlined"
                placeholder={helperText}
                {...inputProps}
                InputProps={{
                    startAdornment: <ManualSearchInputAdornment label={label} />,
                    sx: { px: 0 },
                }}
                inputProps={{
                    sx: { paddingRight: 1 },
                }}
            />
        </FormControl>
    );
};
