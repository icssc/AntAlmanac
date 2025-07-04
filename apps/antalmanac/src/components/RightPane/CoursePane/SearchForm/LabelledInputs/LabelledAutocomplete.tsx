import { Autocomplete, AutocompleteProps, TextField, TextFieldProps } from '@mui/material';
import { useId } from 'react';

import { LabelledInput } from './LabelledInput';

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
            {...autocompleteProps}
            renderInput={(params) => (
                <LabelledInput label={label} isAligned={isAligned} id={id}>
                    <TextField
                        size="small"
                        variant="outlined"
                        {...textFieldProps}
                        inputProps={{
                            ...params.inputProps,
                            'aria-labelledby': `input-label-${id}`,
                        }}
                        InputProps={{
                            ...params.InputProps,
                        }}
                    />
                </LabelledInput>
            )}
        ></Autocomplete>
    );
};
