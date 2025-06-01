import { FormControl, FormControlProps, TextField, TextFieldProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useId } from 'react';

import { SearchAdornment } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/SearchAdornment';
import { useThemeStore } from '$stores/SettingsStore';

interface AdornedTextFieldProps {
    label: string;
    textFieldProps?: TextFieldProps;
    formControlProps?: FormControlProps;
    isAligned?: boolean;
}

export const AdornedTextField = ({ label, textFieldProps, formControlProps, isAligned }: AdornedTextFieldProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    const id = useId();

    return (
        <FormControl variant="outlined" sx={{ minWidth: 200 }} {...formControlProps}>
            <TextField
                size="small"
                variant="outlined"
                {...textFieldProps}
                InputProps={{
                    ...textFieldProps?.InputProps,
                    startAdornment: <SearchAdornment label={label} id={id} isAligned={isAligned} />,
                }}
                inputProps={{
                    ...textFieldProps?.inputProps,
                    sx: {
                        paddingLeft: 1,
                    },
                    'aria-labelledby': `adornment-label-${id}`,
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? grey[500] : grey[600],
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 1,
                        },
                    },
                    '&&& .MuiInputBase-sizeSmall': {
                        paddingLeft: 0,
                    },
                }}
            />
        </FormControl>
    );
};
