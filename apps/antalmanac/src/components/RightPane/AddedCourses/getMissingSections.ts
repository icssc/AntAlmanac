import { CourseWithTerm } from './AddedCoursePane';

export const getMissingSections = (userCourses: CourseWithTerm): string[] => {
    //Get required types from stored section types
    const requiredTypes = userCourses.sectionTypes;
    //Get the section types the user has added
    const userTypes = new Set(userCourses.sections.map((section) => section.sectionType));
    //Compare types the user added with the required types
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
