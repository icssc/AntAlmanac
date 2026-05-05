/**
 * Shared chart area for section-table GPA (grades) and enrollment history popovers.
 * Loading skeleton, empty state, and chart use the same dimensions so the card does not jump.
 */
export function getSectionTableChartPopoverDimensions(isMobile: boolean) {
    if (isMobile) {
        return { width: 280, height: 180 };
    }
    return { width: 400, height: 240 };
}
