import { CourseGQLData } from '../types/types';

export const quarterOptions: Record<string, string> = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
};

export const recentYears = 1;

export function getStartYear() {
    const currentDate = new Date();
    const currentStartYear = currentDate.getMonth() >= 8 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
    return currentStartYear - recentYears;
}

export function checkNotRecentlyOffered(quarters: string[], course: CourseGQLData) {
    if (quarters.length == 0) {
        return false;
    }

    const startYear = getStartYear();
    let notRecentlyOffered = true;

    quarters.forEach((quarter) => {
        const termYear = quarter === 'Fall' ? startYear : startYear + 1;
        for (let i = 0; i <= recentYears; i++) {
            const term = `${termYear - i} ${quarter}`;
            if (course.terms.includes(term)) {
                notRecentlyOffered = false;
                break;
            }
        }
    });

    return notRecentlyOffered;
}
