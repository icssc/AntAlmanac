import {
    amber,
    brown,
    blue,
    cyan,
    deepOrange,
    deepPurple,
    green,
    grey,
    indigo,
    lightBlue,
    pink,
    purple,
    red,
    teal,
    yellow,
} from '@mui/material/colors';
import type { AATerm, ScheduleCourse } from '@packages/antalmanac-types';

export function scheduleOfferingKey(course: Pick<ScheduleCourse, 'term' | 'courseId' | 'courseTitle'>): string {
    return `${course.term.shortName}::${course.courseId}::${course.courseTitle}`;
}

export function scheduleSectionKey(term: AATerm | string, sectionCode: string): string {
    const termId = typeof term === 'string' ? term : term.shortName;
    return `${termId}::${sectionCode}`;
}

const colorVariants: Record<string, string[]> = {
    blue: [blue[300], blue[200], blue[100], blue[400], blue[500]],
    pink: [pink[300], pink[200], pink[100], pink[400], pink[500]],
    purple: [purple[300], purple[200], purple[100], purple[400], purple[500]],
    green: [green[300], green[200], green[100], green[400], green[500]],
    amber: [amber[300], amber[200], amber[100], amber[400], amber[500]],
    deepPurple: [deepPurple[300], deepPurple[200], deepPurple[100], deepPurple[400], deepPurple[500]],
    deepOrange: [deepOrange[300], deepOrange[200], deepOrange[100], deepOrange[400], deepOrange[500]],
};

export const colorPickerPresetColors = [
    brown[200],
    red[200],
    deepOrange[200],
    amber[200],
    yellow[200],
    green[200],
    teal[200],
    cyan[100],
    lightBlue[200],
    indigo[200],
    deepPurple[200],
    pink[200],
    green[300],
    grey[600],
    grey[300],
    grey[50],
];

/**
 * Takes in a hex color and returns a color variant hex color that is not already used.
 * Uses predefined shade variants from the same color family.
 *
 * @param originalColor string: Hex color ("#RRGGBB") as a basis.
 * @param usedColors Set<string>: A set of hex colors that are already used.
 *
 * @return Unused hex color that is close to the original color ("#RRGGBB").
 */
function generateColorVariant(originalColor: string, usedColors: Set<string>): string {
    let family: string | null = null;
    for (const f in colorVariants) {
        if (colorVariants[f].includes(originalColor)) {
            family = f;
            break;
        }
    }

    // Fallback to original color if no family found
    if (!family) return originalColor;

    for (const variant of colorVariants[family]) {
        if (!usedColors.has(variant)) {
            return variant;
        }
    }

    // If all variants are used, fallback to original
    return originalColor;
}

export function getColorForNewSection(newSection: ScheduleCourse, sectionsInSchedule: ScheduleCourse[]): string {
    const defaultColors: string[] = Object.values(colorVariants).map((variants) => variants[0]);
    const usedColors = sectionsInSchedule.map((course) => course.section.color);
    const lastDefaultIndex = usedColors.findLastIndex((color) => defaultColors.includes(color));

    const offeringKey = scheduleOfferingKey(newSection);
    const sameOfferingSections = sectionsInSchedule
        .filter((course) => scheduleOfferingKey(course) === offeringKey)
        .sort(
            (a, b) =>
                Math.abs(parseInt(a.section.sectionCode) - parseInt(newSection.section.sectionCode)) -
                Math.abs(parseInt(b.section.sectionCode) - parseInt(newSection.section.sectionCode))
        );

    const sameSectionType = sameOfferingSections.filter(
        (course) => course.section.sectionType === newSection.section.sectionType
    );
    if (sameSectionType.length > 0) return sameSectionType[0].section.color;

    if (sameOfferingSections.length > 0) {
        return generateColorVariant(sameOfferingSections[0].section.color, new Set(usedColors));
    }

    const nextDefaultIndex = (lastDefaultIndex + 1) % defaultColors.length;
    return defaultColors.find((color) => !usedColors.includes(color)) ?? defaultColors[nextDefaultIndex];
}

/**
 * Temporary measure to group each course's sections together
 * since previous courses were unsorted.
 *
 * Once there are likely no users with unsorted courses, probably in a few years,
 * this function and its call can be deleted.
 *
 * Date written: March 2026
 */
export function groupCourseSections(courses: ScheduleCourse[]): ScheduleCourse[] {
    const offeringIndexes: Record<string, number> = {};
    const groupedCourses: ScheduleCourse[][] = [];
    let index = 0;
    for (const course of courses) {
        const key = scheduleOfferingKey(course);
        if (!Object.hasOwn(offeringIndexes, key)) {
            offeringIndexes[key] = index;
            groupedCourses.push([]);
            index++;
        }
    }
    for (const course of courses) {
        const key = scheduleOfferingKey(course);
        groupedCourses[offeringIndexes[key]].push(course);
    }
    return groupedCourses.flat();
}
