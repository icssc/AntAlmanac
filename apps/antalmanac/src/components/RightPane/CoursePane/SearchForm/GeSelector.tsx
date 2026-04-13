import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useQueryState } from 'nuqs';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { searchParsers } from '$lib/searchParams';

const GE_LIST = [
    { value: 'ANY', label: "All: Don't filter for GE" },
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues' },
] as const;

export function GeSelector() {
    const [ge, setGe] = useQueryState('ge', searchParsers.ge);

    const handleChange = (event: SelectChangeEvent<string>) => {
        setGe(event.target.value);
    };

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                value: ge,
                onChange: handleChange,
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {GE_LIST.map((category) => {
                return (
                    <MenuItem key={category.value} value={category.value}>
                        {category.label}
                    </MenuItem>
                );
            })}
        </LabeledSelect>
    );
}
