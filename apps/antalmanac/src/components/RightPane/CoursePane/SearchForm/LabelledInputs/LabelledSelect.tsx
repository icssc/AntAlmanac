import { Select, SelectProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from './LabelledInput';

interface LabelledSelectProps<T = string | string[]> {
    label: string;
    selectProps?: SelectProps<T>;
    children?: React.ReactNode;
    fullWidth?: boolean;
    isAligned?: boolean;
}

export function LabelledSelect<T = string | string[]>({
    label,
    selectProps,
    children,
    isAligned,
}: LabelledSelectProps<T>) {
    const id = useId();

    return (
        <LabelledInput
            label={label}
            isAligned={isAligned}
            id={id}
            wrapperProps={selectProps?.fullWidth ? { sx: { width: '100%' } } : undefined}
        >
            <Select size="small" variant="outlined" aria-labelledby={`input-label-${id}`} {...selectProps}>
                {children}
            </Select>
        </LabelledInput>
        // <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }} {...formControlProps}>
        //     <Select
        //         {...selectProps}
        //         sx={{
        //             paddingLeft: 0,
        //             '&:hover .MuiOutlinedInput-notchedOutline': {
        //                 borderColor: isDark ? grey[500] : grey[600],
        //             },
        //             '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        //                 borderWidth: 1,
        //             },
        //             '& .MuiSelect-select': {
        //                 paddingLeft: 1,
        //             },
        //             '& .MuiSelect-icon': {
        //                 right: '9px',
        //             },
        //         }}
        //         input={
        //             <OutlinedInput startAdornment={<SearchAdornment label={label} id={id} isAligned={isAligned} />} />
        //         }
        //         aria-labelledby={`adornment-label-${id}`}
        //     >
        //         {children}
        //     </Select>
        // </FormControl>
    );
}
