import { z } from 'zod';

export const SchoolSchema = z.enum([
    'Charlie Dunlop School of Biological Sciences',
    'Claire Trevor School of the Arts',
    'Donald Bren School of Information and Computer Sciences',
    'Joe C. Wen School of Population and Public Health',
    'Paul Merage School of Business',
    'Henry Samueli School of Engineering',
    'School of Education',
    'School of Humanities',
    'School of Law',
    'School of Medicine',
    'School of Pharmacy and Pharmaceutical Sciences',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
    'Sue & Bill Gross School of Nursing',
] as const);

export type School = z.infer<typeof SchoolSchema>;
