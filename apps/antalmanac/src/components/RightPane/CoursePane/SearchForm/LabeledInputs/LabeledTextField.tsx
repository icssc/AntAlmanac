import { TextField, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabeledInput } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledInput';

interface LabeledTextFieldProps {
    id?: string;
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabeledTextField = ({ id, label, textFieldProps, isAligned }: LabeledTextFieldProps) => {
    const generatedId = useId();
    const textFieldId = id ?? generatedId;

    return (
        <LabeledInput label={label} isAligned={isAligned} id={textFieldId}>
            <TextField size="small" variant="outlined" color="secondary" id={textFieldId} {...textFieldProps} />
        </LabeledInput>
    );
};
