import { AASection } from '@packages/antalmanac-types';

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
