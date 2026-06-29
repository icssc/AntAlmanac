import { CustomInputBox } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputBox';
import { CustomInputLabel } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/CustomInputLabel';
import { Box, type TextFieldProps } from '@mui/material';
import { DesktopTimePicker, type TimePickerProps } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useId, useState } from 'react';

interface LabeledTimePickerContentProps {
    label: string;
    timePickerProps?: TimePickerProps;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export default function LabeledTimePickerContent({
    label,
    timePickerProps,
    textFieldProps,
    isAligned,
}: LabeledTimePickerContentProps) {
    const id = useId();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', width: '100%', flex: 1 }}>
                <CustomInputLabel label={label} id={id} isAligned={isAligned} />
                <CustomInputBox
                    boxProps={{
                        ref: (node: HTMLElement | null) => {
                            setAnchorEl(node);
                        },
                    }}
                >
                    <DesktopTimePicker
                        enableAccessibleFieldDOMStructure={false}
                        {...timePickerProps}
                        slotProps={{
                            popper: {
                                anchorEl,
                            },
                            textField: {
                                size: 'small' as const,
                                variant: 'outlined' as const,
                                ...textFieldProps,
                                id,
                            },
                        }}
                    />
                </CustomInputBox>
            </Box>
        </LocalizationProvider>
    );
}
