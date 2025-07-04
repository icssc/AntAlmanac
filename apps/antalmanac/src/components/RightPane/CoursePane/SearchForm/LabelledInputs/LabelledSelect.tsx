import { Select, SelectProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from './LabelledInput';

interface LabelledSelectProps<T = string | string[]> {
    label: string;
    selectProps?: SelectProps<T>;
    children?: React.ReactNode;
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
    );
}
