import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore, { CourseSearchWarningType } from '$components/RightPane/RightPaneStore';
import { getDefaultTerm, termData } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { ComponentProps, useCallback, useEffect, useState } from 'react';

type TermSelectorProps = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export function TermSelector(props: TermSelectorProps) {
    const [term, setTerm] = useState<AATerm>(() => RightPaneStore.getFormData().term);

    const handleChange = (_: unknown, option: AATerm | null) => {
        const value = option ?? getDefaultTerm();

        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', value.shortName);
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);

        RightPaneStore.setTerm(value);

        RightPaneStore.clearWarningMessages(CourseSearchWarningType.TermUnavailable);
    };

    const resetField = useCallback(() => {
        setTerm(RightPaneStore.getFormData().term);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <LabeledAutocomplete
            {...props}
            label="Term"
            autocompleteProps={{
                value: term,
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
}
