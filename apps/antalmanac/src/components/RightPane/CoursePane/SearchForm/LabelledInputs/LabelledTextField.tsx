import { TextField, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledInput';

interface LabelledTextFieldProps {
    id?: string;
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabelledTextField = ({ id, label, textFieldProps, isAligned }: LabelledTextFieldProps) => {
    const generatedId = useId();
    const textFieldId = id ?? generatedId;

    return (
        <LabelledInput label={label} isAligned={isAligned} id={textFieldId}>
            <TextField
                size="small"
                variant="outlined"
                id={textFieldId}
                {...textFieldProps}
                inputProps={{
                    ...textFieldProps?.inputProps,
                    'aria-labelledby': `input-label-${textFieldId}`,
                }}
            />
        </LabelledInput>
    );
};
