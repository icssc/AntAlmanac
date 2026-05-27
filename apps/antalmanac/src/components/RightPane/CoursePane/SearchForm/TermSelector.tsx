import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
import RightPaneStore, { CourseSearchWarningType } from '$components/RightPane/RightPaneStore';
import { getDefaultTerm, termData } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { memo, type ComponentProps } from 'react';

type TermSelectorProps = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export const TermSelector = memo((props: TermSelectorProps) => {
    const [term, setTerm] = useCourseSearchParam('term');

    const handleChange = (_: unknown, option: AATerm | null) => {
        const value = option ?? getDefaultTerm();

        setTerm(value);

        RightPaneStore.clearWarningMessages(CourseSearchWarningType.TermUnavailable);
    };

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
});

TermSelector.displayName = 'TermSelector';
