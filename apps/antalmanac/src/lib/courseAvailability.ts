export function isSectionCancelled(section: { isCancelled?: boolean }) {
    return section.isCancelled === true;
}

export function getCourseCancellationWarning(
    sections: Iterable<{
        sectionCode: string;
        isCancelled?: boolean;
    }>
) {
    const sectionList = [...sections];
    const cancelledSections = sectionList.filter(isSectionCancelled);

    if (cancelledSections.length === 0) {
        return undefined;
    }

    if (cancelledSections.length === sectionList.length) {
        return 'This class has been cancelled.';
    }

    return `Cancelled sections: ${cancelledSections.map((section) => section.sectionCode).join(', ')}.`;
}
