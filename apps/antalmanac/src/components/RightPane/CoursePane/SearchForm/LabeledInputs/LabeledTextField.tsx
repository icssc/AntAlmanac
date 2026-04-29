import { LabeledInput } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledInput';
import { Box, CircularProgress, TextField, TextFieldProps } from '@mui/material';
import { ComponentProps, useId } from 'react';
interface LabeledTextFieldProps {
    id?: string;
    label: string;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
    labelProps?: Omit<ComponentProps<typeof LabeledInput>['labelProps'], 'id' | 'label' | 'isAligned'>;
    loading?: boolean;
    disabled?: boolean;
}

export const LabeledTextField = ({
    id,
    label,
    textFieldProps,
    isAligned,
    labelProps,
    loading,
    disabled,
}: LabeledTextFieldProps) => {
    const generatedId = useId();
    const textFieldId = id ?? generatedId;

    return (
        <LabeledInput labelProps={{ ...labelProps, id: textFieldId, label, isAligned }}>
            <TextField
                size="small"
                variant="outlined"
                id={textFieldId}
                disabled={disabled}
                {...(loading
                    ? {
                          slotProps: {
                              input: {
                                  endAdornment: loading ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                          <CircularProgress size="1.5em" />
                                      </Box>
                                  ) : null,
                              },
                          },
                      }
                    : {})}
                {...textFieldProps}
            />
        </LabeledInput>
    );
};
