import { Select, SelectProps } from '@mui/material';
import { ReactNode, useId } from 'react';

import { LabeledInput } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledInput';

interface LabeledSelectProps<T = string | string[]> {
    label: ReactNode;
    selectProps?: SelectProps<T>;
    children?: ReactNode;
    isAligned?: boolean;
}

export function LabeledSelect<T = string | string[]>({
    label,
    selectProps,
    children,
    isAligned,
}: LabeledSelectProps<T>) {
    const id = useId();

    return (
        <LabeledInput label={label} isAligned={isAligned} id={id}>
            <Select
                size="small"
                variant="outlined"
                inputProps={{ id }}
                MenuProps={{
                    marginThreshold: 4, // reduced from default 16 to disable unwanted dropdown shift caused the page margin being less than marginThreshold
                }}
                {...selectProps}
            >
                {children}
            </Select>
        </LabeledInput>
    );
}
