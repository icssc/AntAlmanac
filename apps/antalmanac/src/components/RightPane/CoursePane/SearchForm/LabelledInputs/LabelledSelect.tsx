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
        <LabelledInput label={label} isAligned={isAligned} id={id}>
            <Select size="small" variant="outlined" labelId={`input-label-${id}`} inputProps={{ id }} {...selectProps}>
                {children}
            </Select>
        </LabelledInput>
    );
}
