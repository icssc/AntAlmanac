import { useQueryState } from 'nuqs';

import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { searchParsers } from '$lib/searchParams';
import { termData } from '$lib/termData';

export function TermSelector() {
    const [term, setTerm] = useQueryState('term', searchParsers.term);

    const handleChange = (_: unknown, option: string | null) => {
        const value = option ?? termData.at(0)?.shortName ?? '';
        setTerm(value);
    };

    return (
        <LabeledAutocomplete
            label="Term"
            autocompleteProps={{
                value: term,
                options: termData.map((term) => term.shortName),
                getOptionLabel: (option) => termData.find((term) => term.shortName === option)?.longName ?? '',
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
