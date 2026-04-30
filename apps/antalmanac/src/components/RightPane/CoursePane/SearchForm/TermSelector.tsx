import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getDefaultTerm, getTermLongName, isTermAvailable, termData } from '$lib/termData';
import { CoursePaneWarningType, useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type Props = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export function TermSelector(props: Props) {
    const [term, setTerm] = useState<string>(() => RightPaneStore.getFormData().term);

    const { setWarningMessages, clearWarningMessages } = useCoursePaneStore(
        useShallow((state) => ({
            setWarningMessages: state.setWarningMessages,
            clearWarningMessages: state.clearWarningMessages,
        }))
    );

    const handleChange = (_: unknown, option: string | null) => {
        const value = option ?? termData.at(0)?.shortName ?? '';

        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', value);
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);

        RightPaneStore.updateFormValue('term', value);

        clearWarningMessages(CoursePaneWarningType.TermUnavailable);
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

    useEffect(() => {
        if (term !== null && !isTermAvailable(term)) {
            const fallbackTerm = getDefaultTerm().shortName;
            const message = `${term} is currently unavailable, falling back to ${fallbackTerm}`;
            openSnackbar('error', message);
            console.error('Error setting term from URL:', message);

            handleChange(null, fallbackTerm);

            setWarningMessages(CoursePaneWarningType.TermUnavailable, [message]);
        }
    }, [term]);

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
