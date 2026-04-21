import { colorVariants, resolveSectionColorPalette } from '$lib/themes';
import {
    amber,
    brown,
    cyan,
    deepOrange,
    deepPurple,
    green,
    grey,
    indigo,
    lightBlue,
    pink,
    red,
    teal,
    yellow,
} from '@mui/material/colors';
import { ScheduleCourse } from '@packages/antalmanac-types';

import { SectionColorSetting, useSectionColorStore, useThemeStore } from './SettingsStore';

export { colorVariants };

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
function generateColorVariant(
    originalColor: string,
    usedColors: Set<string>,
    sectionColor: SectionColorSetting
): string {
    const palette = resolveSectionColorPalette(sectionColor, useThemeStore.getState().isDark);
    let family: string | null = null;
    for (const f in palette) {
        if (palette[f].includes(originalColor)) {
            family = f;
            break;
        }
    }

    // Fallback to original color if no family found
    if (!family) return originalColor;

    for (const variant of palette[family]) {
        if (!usedColors.has(variant)) {
            return variant;
        }
    }

    // If all variants are used, fallback to original
    return originalColor;
}

export function getColorForNewSection(
    newSection: ScheduleCourse,
    sectionsInSchedule: ScheduleCourse[],
    sectionColor = useSectionColorStore.getState().sectionColor
): string {
    // Use the color of the closest section with the same title

    // Array of sections that have the same course title (i.e., they're under the same course),
    // sorted by their distance from the new section's section code
    const existingSections: Array<ScheduleCourse> = sectionsInSchedule
        .filter((course) => course.courseTitle === newSection.courseTitle)
        .sort(
            // Sort by distance from new section's section code
            (a, b) =>
                Math.abs(parseInt(a.section.sectionCode) - parseInt(newSection.section.sectionCode)) -
                Math.abs(parseInt(b.section.sectionCode) - parseInt(newSection.section.sectionCode))
        );

    // New array of courses that share the same sectionType & courseTitle
    const existingSectionsType = existingSections.filter(
        (course) => course.section.sectionType === newSection.section.sectionType
    );
    const palette = resolveSectionColorPalette(sectionColor, useThemeStore.getState().isDark);
    const defaultColors = Object.values(palette).map((variants) => variants[0]);
    const usedColors = sectionsInSchedule.map((course) => course.section.color);
    const lastUsedDefaultColor = usedColors.findLast((c) => defaultColors.includes(c));

    // If the same sectionType exists, return that color
    if (existingSectionsType.length > 0) return existingSectionsType[0].section.color;

    // If the same courseTitle exists, but not the same sectionType, return a close color
    if (existingSections.length > 0) {
        return generateColorVariant(existingSections[0].section.color, new Set(usedColors), sectionColor);
    }

    // If there are no existing sections with the same course title, generate a new color. If we run out of unique colors, return the next color up after the last default color in use, looping after reaching the end.
    const nextAfterLastUsed =
        lastUsedDefaultColor === undefined
            ? 0
            : (defaultColors.indexOf(lastUsedDefaultColor) + 1) % defaultColors.length;
    return (
        defaultColors.find((materialColor) => !usedColors.includes(materialColor)) || defaultColors[nextAfterLastUsed]
    );
}

/**
 * Combines department code, course number, and course title to create an ID unique to a course.
 */
export function getCourseId(course: Pick<ScheduleCourse, 'deptCode' | 'courseNumber' | 'courseTitle'>) {
    return course.deptCode + course.courseNumber + course.courseTitle;
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
    const courseIndexes: { [courseId: string]: number } = {};
    const groupedCourses: ScheduleCourse[][] = [];
    let index = 0;
    for (const course of courses) {
        const courseId = getCourseId(course);
        if (!Object.hasOwn(courseIndexes, courseId)) {
            courseIndexes[courseId] = index;
            groupedCourses.push([]);
            index++;
        }
    }
    for (const course of courses) {
        const courseIndex = courseIndexes[getCourseId(course)];
        groupedCourses[courseIndex].push(course);
    }
    return groupedCourses.flat();
}
