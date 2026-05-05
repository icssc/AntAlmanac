import { CustomInputBox } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputBox';
import { CustomInputLabel } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputLabel';
import { Box } from '@mui/material';
import { ComponentProps } from 'react';

interface LabeledInputProps {
    children: React.ReactNode;
    labelProps: ComponentProps<typeof CustomInputLabel>;
}

export const LabeledInput = ({ children, labelProps }: LabeledInputProps) => {
    return (
        <Box sx={{ display: 'flex', width: '100%', flex: 1 }}>
            <CustomInputLabel {...labelProps} />
            <CustomInputBox>{children}</CustomInputBox>
        </Box>
    );
};
