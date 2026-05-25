import { computeAssignments, getPalette, type SectionColorSetting, type ThemeAssignmentMap } from '$lib/sectionThemes';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import type { ScheduleCourse } from '@packages/antalmanac-types';
import { useMemo } from 'react';

export interface SectionThemeContext {
    setting: SectionColorSetting;
    palette: readonly (readonly string[])[];
    /** Complete assignment map for the active theme (empty when on custom). */
    assignments: ThemeAssignmentMap;
}

/**
 * Resolve the active theme's complete color assignments for the given schedule contents.
 * Existing (persisted) assignments are preserved so survivors keep their colors; only
 * not-yet-assigned sections are filled in. Returns an empty map for the custom setting.
 */
export function useSectionThemeAssignments(
    courses: readonly ScheduleCourse[],
    customEventIds: readonly (string | number)[]
): SectionThemeContext {
    const setting = useSectionThemeStore(selectActiveSectionColor);
    const assignmentsByTheme = useSectionThemeStore((s) => s.assignments);
    const isDark = useThemeStore((s) => s.isDark);

    return useMemo(() => {
        const palette = getPalette(setting, isDark);
        if (setting === 'custom') {
            return { setting, palette, assignments: {} };
        }
        const persisted = assignmentsByTheme[setting] ?? {};
        const { map } = computeAssignments(persisted, courses, customEventIds, palette);
        return { setting, palette, assignments: map };
    }, [setting, assignmentsByTheme, isDark, courses, customEventIds]);
}
