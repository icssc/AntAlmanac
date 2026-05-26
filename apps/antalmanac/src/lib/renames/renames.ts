export interface CourseId {
    department: string;
    courseNumber: string;
}

// `effectiveYear` is the fall-start year the new name first appeared.
// Chains (A → B → C) use two consecutive entries.
export interface CourseRename extends CourseId {
    previously: CourseId;
    effectiveYear: number;
}

export const COURSE_RENAMES: CourseRename[] = [
    {
        department: 'SWE',
        courseNumber: '43',
        previously: { department: 'IN4MATX', courseNumber: '43' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '113',
        previously: { department: 'IN4MATX', courseNumber: '113' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '115',
        previously: { department: 'IN4MATX', courseNumber: '115' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '117',
        previously: { department: 'IN4MATX', courseNumber: '117' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '119',
        previously: { department: 'IN4MATX', courseNumber: '119' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '121',
        previously: { department: 'IN4MATX', courseNumber: '121' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '122',
        previously: { department: 'IN4MATX', courseNumber: '122' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '124',
        previously: { department: 'IN4MATX', courseNumber: '124' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '141',
        previously: { department: 'IN4MATX', courseNumber: '141' },
        effectiveYear: 2026,
    },
    {
        department: 'I&C SCI',
        courseNumber: 'H32',
        previously: { department: 'I&C SCI', courseNumber: '32A' },
        effectiveYear: 2024,
    },
];
