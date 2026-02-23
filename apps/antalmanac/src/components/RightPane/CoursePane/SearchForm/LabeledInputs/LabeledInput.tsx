import { CustomInputBox } from "$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputBox";
import { CustomInputLabel } from "$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputLabel";
import { Box } from "@mui/material";

interface LabeledInputProps {
    label: string;
    children: React.ReactNode;
    id: string;
    isAligned?: boolean;
}

export const LabeledInput = ({ label, children, id, isAligned }: LabeledInputProps) => {
    return (
        <Box sx={{ display: "flex", width: "100%", flex: 1 }}>
            <CustomInputLabel label={label} id={id} isAligned={isAligned} />
            <CustomInputBox>{children}</CustomInputBox>
        </Box>
    );
};
