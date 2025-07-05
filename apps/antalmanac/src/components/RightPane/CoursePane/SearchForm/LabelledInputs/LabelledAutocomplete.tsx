import { Autocomplete, AutocompleteProps, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabelledTextField } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledTextField';

interface LabelledAutocompleteProps<
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

export const LabelledAutocomplete = <T,>({
    label,
    autocompleteProps,
    textFieldProps,
    isAligned,
}: LabelledAutocompleteProps<T>) => {
    const id = useId();

    return (
        <Autocomplete
            size="small"
            id={id}
            {...autocompleteProps}
            renderInput={(params) => (
                <LabelledTextField
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
