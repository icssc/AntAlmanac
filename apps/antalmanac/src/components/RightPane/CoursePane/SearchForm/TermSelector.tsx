import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getTermLongName, termData } from '$lib/termData';
import { ComponentProps, useCallback, useEffect, useState } from 'react';

type Props = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export function TermSelector(props: Props) {
    const [term, setTerm] = useState<string>(() => RightPaneStore.getFormData().term);

    const handleChange = (_: unknown, option: string | null) => {
        const value = option ?? termData.at(0)?.shortName ?? '';

        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', value);
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);

        RightPaneStore.updateFormValue('term', value);
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
                options: termData.map((term) => term.shortName),
                getOptionLabel: (option) => getTermLongName(option),
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
