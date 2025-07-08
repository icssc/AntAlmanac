import { Box, TextField, TextFieldProps } from '@mui/material';
import { DesktopTimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { useId, forwardRef, useState } from 'react';

import { CustomInputBox } from './CustomInputBox';
import { CustomInputLabel } from './CustomInputLabel';

interface LabelledTimePickerProps {
    label: string;
    timePickerProps?: TimePickerProps;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabelledTimePicker = ({ label, timePickerProps, textFieldProps, isAligned }: LabelledTimePickerProps) => {
    const id = useId();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const TimePickerTextField = forwardRef<HTMLInputElement, TextFieldProps>((params, ref) => (
        <TextField size="small" variant="outlined" {...params} {...textFieldProps} id={id} inputRef={ref} />
    ));
    TimePickerTextField.displayName = 'TimePickerTextField';

    return (
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
                    }}
                    slots={{
                        textField: TimePickerTextField,
                    }}
                />
            </CustomInputBox>
        </Box>
    );
};
