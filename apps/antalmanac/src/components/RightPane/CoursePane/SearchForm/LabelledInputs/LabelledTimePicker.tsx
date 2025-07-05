import { TextFieldProps } from '@mui/material';

import { LabelledTextField } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledTextField';
import { useThemeStore } from '$stores/SettingsStore';

interface LabelledTimePickerProps {
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabelledTimePicker = ({ label, textFieldProps, isAligned }: LabelledTimePickerProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <LabelledTextField
            label={label}
            isAligned={isAligned}
            textFieldProps={{
                ...textFieldProps,
                type: 'time',
                sx: {
                    colorScheme: isDark ? 'dark' : 'light',
                },
            }}
        />
    );
};
