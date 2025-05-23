import { FormControl, FormControlProps, OutlinedInput, Select, SelectProps } from '@mui/material';

import { ManualSearchInputAdornment } from './ManualSearchInputAdornment';

interface ManualSearchSelectProps<T = string | string[]> {
    label: string;
    selectProps?: SelectProps<T>;
    formControlProps?: FormControlProps;
    helperText?: string;
    children?: React.ReactNode;
    fullWidth?: boolean;
}

export function ManualSearchSelect<T = string | string[]>({
    label,
    selectProps,
    formControlProps,
    helperText,
    children,
    fullWidth,
}: ManualSearchSelectProps<T>) {
    return (
        <FormControl variant="outlined" size="small" fullWidth={fullWidth} sx={{ minWidth: 200 }} {...formControlProps}>
            <Select
                fullWidth={fullWidth}
                placeholder={helperText}
                {...selectProps}
                sx={{
                    paddingLeft: 0,
                }}
                input={<OutlinedInput startAdornment={<ManualSearchInputAdornment label={label} />} />}
            >
                {children}
            </Select>
        </FormControl>
    );
}
