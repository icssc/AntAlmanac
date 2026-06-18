import { TermAutocomplete, type TermAutocompleteProps } from '$components/RightPane/CoursePane/SearchForm/TermAutocomplete';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { memo } from 'react';

type TermSelectorProps = Omit<TermAutocompleteProps, 'value' | 'onChange'>;

export const TermSelector = memo((props: TermSelectorProps) => {
    const [term, setTerm] = useCourseSearchParam('term');

    return <TermAutocomplete value={term} onChange={setTerm} {...props} />;
});

TermSelector.displayName = 'TermSelector';
