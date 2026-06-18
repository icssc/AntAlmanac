import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { getDefaultTerm, termData } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { memo, type ComponentProps } from 'react';

export type TermAutocompleteProps = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
> & {
    value: AATerm;
    onChange: (term: AATerm) => void;
};

export const TermAutocomplete = memo(({ value, onChange, ...props }: TermAutocompleteProps) => {
    const handleChange = (_: unknown, option: AATerm | null) => {
        onChange(option ?? getDefaultTerm());
    };

    return (
        <LabeledAutocomplete
            {...props}
            label="Term"
            autocompleteProps={{
                value,
                options: termData,
                getOptionLabel: (term: AATerm) => term.longName,
                isOptionEqualToValue: (option: AATerm, value: AATerm) => option.shortName === value.shortName,
                autoHighlight: true,
                openOnFocus: true,
                onChange: handleChange,
                noOptionsText: 'No terms match the search',
            }}
            textFieldProps={{
                fullWidth: true,
            }}
            isAligned
        />
    );
});

TermAutocomplete.displayName = 'TermAutocomplete';
