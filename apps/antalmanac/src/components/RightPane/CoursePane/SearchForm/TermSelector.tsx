import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore, { CourseSearchWarningType } from '$components/RightPane/RightPaneStore';
import { Term, termData } from '$lib/term';
import { ComponentProps, useCallback, useEffect, useState } from 'react';

type TermSelectorProps = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export function TermSelector(props: TermSelectorProps) {
    const [term, setTerm] = useState<Term>(() => RightPaneStore.getFormData().term);

    const handleChange = (_: unknown, option: Term | null) => {
        const value = option ?? termData[0];

        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', value?.shortName ?? '');
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);

        RightPaneStore.updateFormValue('term', value);

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
        <LabeledAutocomplete<Term>
            {...props}
            label="Term"
            autocompleteProps={{
                value: term,
                options: termData,
                getOptionLabel: (option) => option.longName,
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
