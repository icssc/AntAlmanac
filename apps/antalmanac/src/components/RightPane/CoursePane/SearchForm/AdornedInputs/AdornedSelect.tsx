import { FormControl, FormControlProps, OutlinedInput, Select, SelectProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useId } from 'react';

import { SearchAdornment } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/SearchAdornment';
import { useThemeStore } from '$stores/SettingsStore';

interface AdornedSelectProps<T = string | string[]> {
    label: string;
    selectProps?: SelectProps<T>;
    formControlProps?: FormControlProps;
    children?: React.ReactNode;
    isAligned?: boolean;
}

export function AdornedSelect<T = string | string[]>({
    label,
    selectProps,
    formControlProps,
    children,
    isAligned,
}: AdornedSelectProps<T>) {
    const isDark = useThemeStore((store) => store.isDark);
    const id = useId();

    return (
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }} {...formControlProps}>
            <Select
                {...selectProps}
                sx={{
                    paddingLeft: 0,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? grey[500] : grey[600],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 1,
                    },
                    '& .MuiSelect-select': {
                        paddingLeft: 1,
                    },
                    '& .MuiSelect-icon': {
                        right: '9px',
                    },
                }}
                input={
                    <OutlinedInput startAdornment={<SearchAdornment label={label} id={id} isAligned={isAligned} />} />
                }
                aria-labelledby={`adornment-label-${id}`}
            >
                {children}
            </Select>
        </FormControl>
    );
}
