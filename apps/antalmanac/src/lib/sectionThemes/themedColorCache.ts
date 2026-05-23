import { resolveCourseColors, type SectionThemeId } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import type { ScheduleCourse } from '@packages/antalmanac-types';

/**
 * Memoized wrapper around `resolveCourseColors`. The section table renders one row
 * per section, each of which needs the themed color for its course — without this
 * cache, every row redoes the O(N) resolution, making the table O(N²) on each
 * schedule change. The cache key is the courses array reference + theme + dark mode;
 * AppStore events invalidate it on every schedule mutation.
 */

let cached: {
    courses: readonly ScheduleCourse[];
    theme: SectionThemeId;
    isDark: boolean;
    colors: string[];
} | null = null;

const invalidate = () => {
    cached = null;
};

AppStore.on('addedCoursesChange', invalidate);
AppStore.on('currentScheduleIndexChange', invalidate);
AppStore.on('colorChange', invalidate);

export function getThemedCourseColors(
    courses: readonly ScheduleCourse[],
    theme: SectionThemeId,
    isDark: boolean
): string[] {
    if (cached && cached.courses === courses && cached.theme === theme && cached.isDark === isDark) {
        return cached.colors;
    }
    const colors = resolveCourseColors(courses, theme, isDark);
    cached = { courses, theme, isDark, colors };
    return colors;
}
