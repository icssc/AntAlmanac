import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import {
    getLocalStorageSectionColor,
    getLocalStorageSectionColorAssignments,
    setLocalStorageSectionColor,
    setLocalStorageSectionColorAssignments,
} from '$lib/localStorage';
import {
    computeAssignments,
    getPalette,
    isSectionColorSetting,
    type SectionColorSetting,
    type SectionThemeId,
    type ThemeAssignmentMap,
} from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';
import type { PostHog } from 'posthog-js/react';
import { create } from 'zustand';

/** Persisted per-theme color assignments: theme id -> (section key -> slot or "#hex" override). */
type AssignmentsByTheme = Partial<Record<SectionThemeId, ThemeAssignmentMap>>;

interface SectionThemeStore {
    /** The persisted setting — what the user actually chose. */
    sectionColor: SectionColorSetting;
    /** Ephemeral preview override (while hovering options in the picker). */
    previewSectionColor: SectionColorSetting | null;
    /** Per-theme color assignments (palette slots + manual overrides). */
    assignments: AssignmentsByTheme;

    setSectionColor: (value: SectionColorSetting, postHog?: PostHog) => void;
    setPreviewSectionColor: (value: SectionColorSetting | null) => void;
    /** Override a single section/custom-event's color within the given theme. */
    setManualColor: (theme: SectionThemeId, key: string, color: string) => void;
    /** Clear all manual + assigned colors for a theme so it recomputes from the palette. */
    resetTheme: (theme: SectionThemeId) => void;
    /** Fill assignments for the active theme's current sections; prune removed ones. */
    ensureAssignments: () => void;
}

function readStoredSectionColor(): SectionColorSetting {
    const raw = getLocalStorageSectionColor();
    // Default users to 'custom' so their hand-picked colors are preserved.
    return isSectionColorSetting(raw) ? raw : 'custom';
}

function readStoredAssignments(): AssignmentsByTheme {
    const raw = getLocalStorageSectionColorAssignments();
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? (parsed as AssignmentsByTheme) : {};
    } catch {
        return {};
    }
}

function persistAssignments(assignments: AssignmentsByTheme) {
    setLocalStorageSectionColorAssignments(JSON.stringify(assignments));
}

export const useSectionThemeStore = create<SectionThemeStore>((set, get) => ({
    sectionColor: readStoredSectionColor(),
    previewSectionColor: null,
    assignments: readStoredAssignments(),

    setSectionColor: (value, postHog) => {
        setLocalStorageSectionColor(value);
        set({ sectionColor: value, previewSectionColor: null });
        get().ensureAssignments();
        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CHANGE_SECTION_COLOR,
            customProps: { sectionColor: value },
        });
    },

    setPreviewSectionColor: (value) => set({ previewSectionColor: value }),

    setManualColor: (theme, key, color) => {
        const assignments = { ...get().assignments, [theme]: { ...get().assignments[theme], [key]: color } };
        persistAssignments(assignments);
        set({ assignments });
    },

    resetTheme: (theme) => {
        const assignments = { ...get().assignments };
        delete assignments[theme];
        persistAssignments(assignments);
        set({ assignments });
        get().ensureAssignments();
    },

    ensureAssignments: () => {
        const { sectionColor, assignments } = get();
        if (sectionColor === 'custom') return;

        const courses = AppStore.schedule.getCurrentCourses();
        const customEventIds = AppStore.schedule.getCurrentCustomEvents().map((event) => event.customEventID);
        const palette = getPalette(sectionColor, useThemeStore.getState().isDark);

        const { map, changed } = computeAssignments(assignments[sectionColor] ?? {}, courses, customEventIds, palette);
        if (!changed) return;

        const nextAssignments = { ...assignments, [sectionColor]: map };
        persistAssignments(nextAssignments);
        set({ assignments: nextAssignments });
    },
}));

/**
 * The section color setting currently in effect — preview (if hovering) or persisted otherwise.
 */
export const selectActiveSectionColor = (s: SectionThemeStore): SectionColorSetting =>
    s.previewSectionColor ?? s.sectionColor;

// Keep assignments in sync with the schedule: assign colors to newly added sections and
// drop colors for removed ones, so deletions never reshuffle the survivors' colors.
const syncAssignments = () => useSectionThemeStore.getState().ensureAssignments();
AppStore.on('addedCoursesChange', syncAssignments);
AppStore.on('customEventsChange', syncAssignments);
AppStore.on('currentScheduleIndexChange', syncAssignments);
