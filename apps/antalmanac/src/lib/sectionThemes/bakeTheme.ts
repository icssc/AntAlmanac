import { changeCourseColor, changeCustomEventColor } from '$actions/AppStoreActions';
import { getPrimaryColors, resolveCourseColors, type SectionThemeId } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';

/**
 * Persist the currently-displayed themed colors onto every course and custom event
 * in the schedule, so switching to "custom" doesn't visually change anything.
 *
 * Call this right before applying a user-driven color edit while on a preset theme —
 * combined with `setSectionColor('custom', ...)`, it gives the effect of "as soon as
 * you tweak a theme, your tweak forks the theme into a custom palette."
 */
export function bakeThemeIntoSchedule(theme: SectionThemeId, isDark: boolean): void {
    const courses = AppStore.schedule.getCurrentCourses();
    const courseColors = resolveCourseColors(courses, theme, isDark);
    courses.forEach((course, i) => {
        changeCourseColor(course.section.sectionCode, course.term, courseColors[i]);
    });

    const primaries = getPrimaryColors(theme, isDark);
    if (primaries.length > 0) {
        const customEvents = AppStore.schedule.getCurrentCustomEvents();
        customEvents.forEach((event, i) => {
            changeCustomEventColor(event.customEventID, primaries[i % primaries.length]);
        });
    }
}
