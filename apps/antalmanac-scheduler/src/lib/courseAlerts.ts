import { type AACourseWithTerm, type AASection } from '@packages/antalmanac-types';
import { type WebsocSectionType } from '@packages/anteater-api/types';

export function getMissingSections(course: AACourseWithTerm): string[] {
    const requiredTypes = new Set<WebsocSectionType>(course.sectionTypes ?? []);

    if (requiredTypes.size === 0) {
        return [];
    }

    const addedTypes = new Set(course.sections.map((section) => section.sectionType));
    const missingTypes = [...requiredTypes].filter((type) => !addedTypes.has(type));

    return missingTypes.map((sectionType) => {
        switch (sectionType) {
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
                return sectionType;
        }
    });
}

export function getCourseCancellationWarning(sections: AASection[]) {
    const cancelledSections = sections.filter((section) => section.isCancelled);

    if (cancelledSections.length === 0) {
        return undefined;
    }

    if (cancelledSections.length === sections.length) {
        return 'This class has been cancelled.';
    }

    return `Cancelled sections: ${cancelledSections.map((section) => section.sectionCode).join(', ')}.`;
}
