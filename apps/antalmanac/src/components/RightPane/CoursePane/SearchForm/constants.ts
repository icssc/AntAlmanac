import { WEBSOC_GE_OPTIONS, type WebsocGeOption } from '@packages/antalmanac-types';

interface GeOption {
    value: WebsocGeOption;
    label: string;
    shortLabel: string;
}

export const GE_OPTIONS: readonly GeOption[] = [
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing', shortLabel: 'GE Ia (1a)' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing', shortLabel: 'GE Ib (1b)' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology', shortLabel: 'GE II (2)' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences', shortLabel: 'GE III (3)' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities', shortLabel: 'GE IV (4)' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy', shortLabel: 'GE Va (5a)' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning', shortLabel: 'GE Vb (5b)' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English', shortLabel: 'GE VI (6)' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies', shortLabel: 'GE VII (7)' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues', shortLabel: 'GE VIII (8)' },
];

/** UI-only sentinel for the "don't filter for GE" menu entry (an empty selection). */
export const ANY_GE = 'ANY';
export const ANY_GE_LABEL = "ANY: Don't filter for GE";

const GE_OPTION_BY_VALUE = new Map(GE_OPTIONS.map((option) => [option.value, option]));

export const getGeLabel = (value: WebsocGeOption) => GE_OPTION_BY_VALUE.get(value)?.label ?? value;
export const getGeShortLabel = (value: WebsocGeOption) => GE_OPTION_BY_VALUE.get(value)?.shortLabel ?? value;

const GE_OPTION_VALUES = new Set<string>(WEBSOC_GE_OPTIONS);

/** Type guard narrowing an arbitrary string to a valid GE category code. */
export const isGeOption = (value: string): value is WebsocGeOption => GE_OPTION_VALUES.has(value);
