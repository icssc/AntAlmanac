import { Box } from '@mui/material';

import { CustomInputBox } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/CustomInputBox';
import { CustomInputLabel } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/CustomInputLabel';

interface LabelledInputProps {
    label: string;
    children: React.ReactNode;
    id: string;
    isAligned?: boolean;
}

export const LabelledInput = ({ label, children, id, isAligned }: LabelledInputProps) => {
    return (
        <Box sx={{ display: 'flex', width: '100%', flex: 1 }}>
            <CustomInputLabel label={label} id={id} isAligned={isAligned} />
            <CustomInputBox>{children}</CustomInputBox>
        </Box>
    );
};
