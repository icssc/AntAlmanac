import { TextField, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledInput';

interface LabelledTextFieldProps {
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabelledTextField = ({ label, textFieldProps, isAligned }: LabelledTextFieldProps) => {
    const id = useId();

    return (
        <LabelledInput label={label} isAligned={isAligned} id={id}>
            <TextField
                size="small"
                variant="outlined"
                {...textFieldProps}
                inputProps={{
                    ...textFieldProps?.inputProps,
                    id,
                    'aria-labelledby': `input-label-${id}`,
                }}
            />
        </LabelledInput>
    );
};
