import { isSkeletonEvent, type CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
import type { ScheduleCourse } from '@packages/antalmanac-types';

import { SECTION_THEMES, type SectionTheme, type SectionThemeId } from './themes';

export { SECTION_THEMES };
export type { SectionTheme, SectionThemeId };

/**
 * "custom" means: use whatever color the user picked per-course (stored on the course itself).
 * Any other value is a preset theme id.
 */
export type SectionColorSetting = SectionThemeId | 'custom';

export function isSectionColorSetting(value: unknown): value is SectionColorSetting {
    return value === 'custom' || SECTION_THEMES.some((t) => t.id === value);
}

/**
 * Resolve which palette to use for a given theme. Falls back to the light palette
 * when the theme has no dark variant.
 */
export function getPalette(theme: SectionColorSetting | string, isDark: boolean): readonly (readonly string[])[] {
    const def = SECTION_THEMES.find((t) => t.id === theme) ?? SECTION_THEMES[0];
    return isDark && def.dark ? def.dark : def.light;
}

/** Primary color (variant 0) of each family in a theme — the colors a fresh course gets. */
export function getPrimaryColors(theme: SectionColorSetting | string, isDark: boolean): string[] {
    return getPalette(theme, isDark).map((family) => family[0]);
}

/**
 * Pick a color for a course given a palette and the courses already assigned colors.
 *
 * Rules (in priority order):
 *   1. Same courseTitle AND same sectionType already assigned → reuse that color.
 *   2. Same courseTitle, different sectionType → use an unused variant in the same family,
 *      based on the closest section by sectionCode.
 *   3. New courseTitle → next unused primary color, wrapping around if all are taken.
 */
export function pickColor(
    course: ScheduleCourse,
    assigned: readonly { course: ScheduleCourse; color: string }[],
    palette: readonly (readonly string[])[]
): string {
    const sameTypeMatch = assigned.find(
        (a) =>
            a.course.courseTitle === course.courseTitle && a.course.section.sectionType === course.section.sectionType
    );
    if (sameTypeMatch) return sameTypeMatch.color;

    const usedColors = new Set(assigned.map((a) => a.color));

    const sameCourseClosest = assigned
        .filter((a) => a.course.courseTitle === course.courseTitle)
        .sort(
            (a, b) =>
                Math.abs(parseInt(a.course.section.sectionCode) - parseInt(course.section.sectionCode)) -
                Math.abs(parseInt(b.course.section.sectionCode) - parseInt(course.section.sectionCode))
        )[0];

    if (sameCourseClosest) {
        const family = palette.find((f) => f.includes(sameCourseClosest.color));
        const variant = family?.find((c) => !usedColors.has(c));
        return variant ?? sameCourseClosest.color;
    }

    const primaries = palette.map((f) => f[0]);
    const unusedPrimary = primaries.find((c) => !usedColors.has(c));
    if (unusedPrimary) return unusedPrimary;
    return primaries[assigned.length % primaries.length];
}

/**
 * Compute themed colors for every course, deterministically based on schedule order.
 * Returns an array aligned with `courses` (same length, same order).
 */
export function resolveCourseColors(
    courses: readonly ScheduleCourse[],
    theme: SectionThemeId,
    isDark: boolean
): string[] {
    const palette = getPalette(theme, isDark);
    const assigned: { course: ScheduleCourse; color: string }[] = [];
    for (const course of courses) {
        const color = pickColor(course, assigned, palette);
        assigned.push({ course, color });
    }
    return assigned.map((a) => a.color);
}

function courseColorMap(courses: readonly ScheduleCourse[], theme: SectionThemeId, isDark: boolean) {
    const colors = resolveCourseColors(courses, theme, isDark);
    const map = new Map<string, string>();
    courses.forEach((course, i) => {
        map.set(courseKey(course), colors[i]);
    });
    return map;
}

function courseKey(course: { term: unknown; section: { sectionCode: string } }) {
    return `${String(course.term)}|${course.section.sectionCode}`;
}

function courseEventKey(event: { term: unknown; sectionCode: string }) {
    return `${String(event.term)}|${event.sectionCode}`;
}

/**
 * Apply a section color theme to calendar events without mutating the input.
 * Returns the events unchanged when the user has chosen 'custom'.
 *
 * Custom (non-course) events get colors cycling through the palette's primary colors
 * in their schedule order, so they remain consistent across re-renders.
 */
export function applyThemeToCalendarEvents<E extends CalendarEvent>(
    events: readonly E[],
    courses: readonly ScheduleCourse[],
    setting: SectionColorSetting,
    isDark: boolean
): E[] {
    if (setting === 'custom') return [...events];

    const courseColors = courseColorMap(courses, setting, isDark);
    const primaries = getPalette(setting, isDark).map((f) => f[0]);

    const customEventColorById = new Map<string, string>();
    let nextCustomIndex = 0;

    return events.map((event): E => {
        if (isSkeletonEvent(event)) return event;
        if (event.isCustomEvent) {
            const id = String(event.customEventID);
            let color = customEventColorById.get(id);
            if (color == null) {
                color = primaries[nextCustomIndex % primaries.length];
                customEventColorById.set(id, color);
                nextCustomIndex++;
            }
            return { ...event, color };
        }
        const color = courseColors.get(courseEventKey(event));
        return color != null ? { ...event, color } : event;
    });
}
