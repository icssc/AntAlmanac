import { TextField, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledInput';
import { useThemeStore } from '$stores/SettingsStore';

interface LabelledTimePickerProps {
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabelledTimePicker = ({ label, textFieldProps, isAligned }: LabelledTimePickerProps) => {
    const id = useId();
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <LabelledInput label={label} isAligned={isAligned} id={id}>
            <TextField
                size="small"
                variant="outlined"
                {...textFieldProps}
                type="time"
                sx={{
                    colorScheme: isDark ? 'dark' : 'light',
                }}
                inputProps={{
                    ...textFieldProps?.inputProps,
                    id,
                    'aria-labelledby': `input-label-${id}`,
                }}
            />
        </LabelledInput>
    );
};
