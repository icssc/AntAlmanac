import { getPalette, type SectionColorSetting, type ThemeAssignmentMap } from '$lib/sectionThemes';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import { useMemo } from 'react';

export interface SectionThemeContext {
    setting: SectionColorSetting;
    palette: readonly (readonly string[])[];
    /** Complete assignment map for the active theme (empty when on custom). */
    assignments: ThemeAssignmentMap;
}

/**
 * Resolve the active theme's complete color assignments for the current schedule.
 *
 * Reads the single source of truth ({@link useSectionThemeStore.activeAssignments}), which the
 * store keeps in sync with the schedule and the previewed/chosen theme. Every color consumer
 * (calendar, map, section-table color strips, color picker) reads from the same place, so they
 * always agree. Returns an empty map for the custom setting.
 */
export function useSectionThemeAssignments(): SectionThemeContext {
    const setting = useSectionThemeStore(selectActiveSectionColor);
    const activeAssignments = useSectionThemeStore((s) => s.activeAssignments);
    const isDark = useThemeStore((s) => s.isDark);

    return useMemo(() => {
        const palette = getPalette(setting, isDark);
        return { setting, palette, assignments: setting === 'custom' ? {} : activeAssignments };
    }, [setting, activeAssignments, isDark]);
}
