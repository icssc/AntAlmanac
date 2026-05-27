import { WEBSOC_FILTER_GE_VALUES, WEBSOC_GE_VALUES, type WebsocFilterGe } from '@packages/anteater-api/types';

export const GE_LABELS = {
    'GE-1A': { label: 'GE Ia (1a): Lower Division Writing', shortLabel: 'GE Ia (1a)' },
    'GE-1B': { label: 'GE Ib (1b): Upper Division Writing', shortLabel: 'GE Ib (1b)' },
    'GE-2': { label: 'GE II (2): Science and Technology', shortLabel: 'GE II (2)' },
    'GE-3': { label: 'GE III (3): Social and Behavioral Sciences', shortLabel: 'GE III (3)' },
    'GE-4': { label: 'GE IV (4): Arts and Humanities', shortLabel: 'GE IV (4)' },
    'GE-5A': { label: 'GE Va (5a): Quantitative Literacy', shortLabel: 'GE Va (5a)' },
    'GE-5B': { label: 'GE Vb (5b): Formal Reasoning', shortLabel: 'GE Vb (5b)' },
    'GE-6': { label: 'GE VI (6): Language other than English', shortLabel: 'GE VI (6)' },
    'GE-7': { label: 'GE VII (7): Multicultural Studies', shortLabel: 'GE VII (7)' },
    'GE-8': { label: 'GE VIII (8): International/Global Issues', shortLabel: 'GE VIII (8)' },
} satisfies Record<WebsocFilterGe, { label: string; shortLabel: string }>;

export const ANY_GE_OPTION = {
    value: WEBSOC_GE_VALUES[0],
    label: "ANY: Don't filter for GE",
    shortLabel: 'Any GEs',
} as const;

export const GE_OPTIONS = [
    ANY_GE_OPTION,
    ...WEBSOC_FILTER_GE_VALUES.map((value) => ({
        value,
        ...GE_LABELS[value],
    })),
];

export const EXCLUDE_RESTRICTION_CODES_OPTIONS = [
    { value: 'A', label: 'A: Prerequisite required' },
    { value: 'B', label: 'B: Authorization code required' },
    { value: 'C', label: 'C: Fee required' },
    { value: 'D', label: 'D: Pass/Not Pass option only' },
    { value: 'E', label: 'E: Freshmen only' },
    { value: 'F', label: 'F: Sophomores only' },
    { value: 'G', label: 'G: Lower-division only' },
    { value: 'H', label: 'H: Juniors only' },
    { value: 'I', label: 'I: Seniors only' },
    { value: 'J', label: 'J: Upper-division only' },
    { value: 'K', label: 'K: Graduate only' },
    { value: 'L', label: 'L: Major only' },
    { value: 'M', label: 'M: Non-major only' },
    { value: 'N', label: 'N: School major only' },
    { value: 'O', label: 'O: Non-school major only' },
    { value: 'R', label: 'R: Biomedical Pass/Fail course (School of Medicine only)' },
    { value: 'S', label: 'S: Satisfactory/Unsatisfactory only' },
    { value: 'X', label: 'X: Separate authorization codes required to add, drop, or change enrollment' },
];

export const DAYS_OPTIONS = [
    { value: 'Su', label: 'Su: Sunday' },
    { value: 'M', label: 'M: Monday' },
    { value: 'Tu', label: 'Tu: Tuesday' },
    { value: 'W', label: 'W: Wednesday' },
    { value: 'Th', label: 'Th: Thursday' },
    { value: 'F', label: 'F: Friday' },
    { value: 'Sa', label: 'Sa: Saturday' },
];
