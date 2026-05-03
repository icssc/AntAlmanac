import { WebsocSectionType } from '@packages/antalmanac-types';

import { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedCoursePane';

/**
 * Returns human-readable labels for section types the user has not added yet.
 *
 * Product assumption: every modality listed in `course.sectionTypes` (the union of
 * types WebSOC lists for that offering) is treated as required—the schedule should
 * include at least one section per type. When `sectionTypes` is empty we cannot
 * infer requirements and return no missing labels.
 */
export const getMissingSections = (userCourses: CourseWithTerm): string[] => {
    const requiredTypes = new Set<WebsocSectionType>(userCourses.sectionTypes ?? []);

    if (requiredTypes.size === 0) {
        return [];
    }

    const userTypes = new Set(userCourses.sections.map((section) => section.sectionType));
    const missingTypes = [...requiredTypes].filter((type) => !userTypes.has(type));
    const missingSections = missingTypes.map((section) => {
        switch (section) {
            case 'Dis':
                return 'Discussion';
            case 'Lab':
                return 'Lab';
            case 'Lec':
                return 'Lecture';
            case 'Sem':
                return 'Seminar';
            case 'Res':
                return 'Research';
            case 'Qiz':
                return 'Quiz';
            case 'Tap':
                return 'Tutorial Assistance Program';
            case 'Col':
                return 'Colloquium';
            case 'Act':
                return 'Activity';
            case 'Stu':
                return 'Studio';
            case 'Tut':
                return 'Tutorial';
            case 'Fld':
                return 'Fieldwork';
            default:
                return section;
        }
    });
    return missingSections;
};
