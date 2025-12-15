import { WebsocSectionType } from '@packages/antalmanac-types';

import { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedCoursePane';

export const getMissingSections = (userCourses: CourseWithTerm): string[] => {
    //This will cause an error if a user has data that is not yet enriched because they fetched it before the feature was released
    const requiredTypes = userCourses.sectionTypes ?? new Set<WebsocSectionType>();

    // If no required types, no sections can be missing
    if (requiredTypes.size === 0) {
        console.log('required types for ' + userCourses.courseTitle + ': ', requiredTypes);
        console.log('protected!');
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
