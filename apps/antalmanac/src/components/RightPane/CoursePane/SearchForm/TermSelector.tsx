import {
    selectFormField,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/courseSearchUrlState';
import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore, { CourseSearchWarningType } from '$components/RightPane/RightPaneStore';
import { getDefaultTerm, termData } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { ComponentProps } from 'react';

type TermSelectorProps = Omit<
    ComponentProps<typeof LabeledAutocomplete>,
    'label' | 'autocompleteProps' | 'textFieldProps' | 'isAligned'
>;

export function TermSelector(props: TermSelectorProps) {
    const term = useCourseSearchUrlState(selectFormField('term'));
    const setField = useCourseSearchUrlState((state) => state.setField);

    const handleChange = (_: unknown, option: AATerm | null) => {
        const value = option ?? getDefaultTerm();

        void setField('term', value);

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
}
