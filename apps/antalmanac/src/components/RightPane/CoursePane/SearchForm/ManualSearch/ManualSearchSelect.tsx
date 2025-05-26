import { FormControl, FormControlProps, OutlinedInput, Select, SelectProps } from '@mui/material';
import { grey } from '@mui/material/colors';

import { ManualSearchInputAdornment } from './ManualSearchInputAdornment';

import { BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

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
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <FormControl variant="outlined" size="small" fullWidth={fullWidth} sx={{ minWidth: 200 }} {...formControlProps}>
            <Select
                fullWidth={fullWidth}
                placeholder={helperText}
                {...selectProps}
                sx={{
                    paddingLeft: 0,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? grey[400] : grey[600],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? BLUE : undefined,
                        borderWidth: 1,
                    },
                    '& .MuiSelect-select': {
                        paddingLeft: 1,
                    },
                }}
                input={<OutlinedInput startAdornment={<ManualSearchInputAdornment label={label} />} />}
            >
                {children}
            </Select>
        </FormControl>
    );
}
