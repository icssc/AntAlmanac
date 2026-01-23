import { Autocomplete, type AutocompleteProps, type TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';

interface LabeledAutocompleteProps<
    T,
    Multiple extends boolean = false,
    DisableClearable extends boolean = false,
    FreeSolo extends boolean = false,
> {
    label: string;
    autocompleteProps: Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabeledAutocomplete = <T,>({
    label,
    autocompleteProps,
    textFieldProps,
    isAligned,
}: LabeledAutocompleteProps<T>) => {
    const id = useId();

    return (
        <Autocomplete
            size="small"
            id={id}
            sx={{
                display: 'flex',
                flex: 1,
                width: '100%',
            }}
            {...autocompleteProps}
            renderInput={(params) => (
                <LabeledTextField
                    label={label}
                    isAligned={isAligned}
                    id={id}
                    textFieldProps={{
                        ...textFieldProps,
                        InputProps: {
                            ...params.InputProps,
                            ...textFieldProps?.InputProps,
                        },
                        inputProps: {
                            ...params.inputProps,
                            ...textFieldProps?.inputProps,
                        },
                    }}
                />
            )}
        ></Autocomplete>
    );
};
