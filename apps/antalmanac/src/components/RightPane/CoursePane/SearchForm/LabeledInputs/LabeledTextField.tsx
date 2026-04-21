import { LabeledInput } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledInput';
import { TextField, TextFieldProps } from '@mui/material';
import { ComponentProps, useId } from 'react';
interface LabeledTextFieldProps {
    id?: string;
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
    labelProps?: Omit<ComponentProps<typeof LabeledInput>['labelProps'], 'id' | 'label' | 'isAligned'>;
}

export const LabeledTextField = ({ id, label, textFieldProps, isAligned, labelProps }: LabeledTextFieldProps) => {
    const generatedId = useId();
    const textFieldId = id ?? generatedId;

    return (
        <LabeledInput labelProps={{ ...labelProps, id: textFieldId, label, isAligned }}>
            <TextField size="small" variant="outlined" id={textFieldId} {...textFieldProps} />
        </LabeledInput>
    );
};
