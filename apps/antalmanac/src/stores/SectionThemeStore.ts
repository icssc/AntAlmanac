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
    /**
     * Resolved assignment map (palette slots + overrides) for the *active* theme — i.e. the
     * preview theme while hovering, otherwise the chosen one — covering every current section
     * and custom event. This is the single source of truth all color consumers read from
     * (calendar, map, section-table color strips, and the color picker), so they always agree.
     * Empty on the custom setting.
     */
    activeAssignments: ThemeAssignmentMap;

    setSectionColor: (value: SectionColorSetting, postHog?: PostHog) => void;
    setPreviewSectionColor: (value: SectionColorSetting | null) => void;
    /** Override a single section/custom-event's color within the given theme. */
    setManualColor: (theme: SectionThemeId, key: string, color: string) => void;
    /** Clear all manual + assigned colors for a theme so it recomputes from the palette. */
    resetTheme: (theme: SectionThemeId) => void;
    /** Fill assignments for the active theme's current sections; prune removed ones. */
    ensureAssignments: () => void;
    /** Recompute {@link activeAssignments} for the currently active (preview-aware) theme. */
    recomputeActiveAssignments: () => void;
}

function readStoredSectionColor(): SectionColorSetting {
    if (typeof window === 'undefined') return 'custom';
    const raw = getLocalStorageSectionColor();
    return isSectionColorSetting(raw) ? raw : 'custom';
}

function readStoredAssignments(): AssignmentsByTheme {
    if (typeof window === 'undefined') return {};
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

/**
 * Compute the resolved assignment map (palette slots + overrides) for `setting` over the
 * current schedule. Mirrors the calendar's resolution exactly so every consumer agrees.
 * Slots are palette-shape based and identical across light/dark, so `isDark` is irrelevant here.
 */
function computeActiveMap(assignments: AssignmentsByTheme, setting: SectionColorSetting): ThemeAssignmentMap {
    if (setting === 'custom') return {};
    const courses = AppStore.schedule.getCurrentCourses();
    const customEventIds = AppStore.schedule.getCurrentCustomEvents().map((event) => event.customEventID);
    const palette = getPalette(setting, false);
    const { map } = computeAssignments(assignments[setting] ?? {}, courses, customEventIds, palette);
    return map;
}

function mapsEqual(a: ThemeAssignmentMap, b: ThemeAssignmentMap): boolean {
    const aKeys = Object.keys(a);
    if (aKeys.length !== Object.keys(b).length) return false;
    return aKeys.every((key) => a[key] === b[key]);
}

export const useSectionThemeStore = create<SectionThemeStore>((set, get) => {
    const initialAssignments = readStoredAssignments();
    const initialSectionColor = readStoredSectionColor();

    return {
        sectionColor: initialSectionColor,
        previewSectionColor: null,
        assignments: initialAssignments,
        activeAssignments: computeActiveMap(initialAssignments, initialSectionColor),

        setSectionColor: (value, postHog) => {
            setLocalStorageSectionColor(value);
            set({ sectionColor: value, previewSectionColor: null });
            get().ensureAssignments();
            get().recomputeActiveAssignments();
            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.CHANGE_SECTION_COLOR,
                customProps: { sectionColor: value },
            });
        },

        setPreviewSectionColor: (value) => {
            set({ previewSectionColor: value });
            get().recomputeActiveAssignments();
        },

        setManualColor: (theme, key, color) => {
            const assignments = { ...get().assignments, [theme]: { ...get().assignments[theme], [key]: color } };
            persistAssignments(assignments);
            set({ assignments });
            get().recomputeActiveAssignments();
        },

        resetTheme: (theme) => {
            const assignments = { ...get().assignments };
            delete assignments[theme];
            persistAssignments(assignments);
            set({ assignments });
            get().ensureAssignments();
            get().recomputeActiveAssignments();
        },

        ensureAssignments: () => {
            const { sectionColor, assignments } = get();
            if (sectionColor === 'custom') return;

            const courses = AppStore.schedule.getCurrentCourses();
            const customEventIds = AppStore.schedule.getCurrentCustomEvents().map((event) => event.customEventID);
            const palette = getPalette(sectionColor, false);

            const existing = assignments[sectionColor] ?? {};
            const { map } = computeAssignments(existing, courses, customEventIds, palette);

            // Merge rather than replace: assignment keys are global (term|sectionCode), and
            // computeAssignments only returns the *current* schedule's keys. Replacing would
            // drop assignments/overrides belonging to other schedules, losing them on switch.
            const hasNew = Object.keys(map).some((key) => existing[key] !== map[key]);
            if (!hasNew) return;

            const nextAssignments = { ...assignments, [sectionColor]: { ...existing, ...map } };
            persistAssignments(nextAssignments);
            set({ assignments: nextAssignments });
        },

        recomputeActiveAssignments: () => {
            const { assignments, previewSectionColor, sectionColor, activeAssignments } = get();
            const next = computeActiveMap(assignments, previewSectionColor ?? sectionColor);
            if (mapsEqual(activeAssignments, next)) return;
            set({ activeAssignments: next });
        },
    };
});

/**
 * The section color setting currently in effect — preview (if hovering) or persisted otherwise.
 */
export const selectActiveSectionColor = (s: SectionThemeStore): SectionColorSetting =>
    s.previewSectionColor ?? s.sectionColor;

// Keep assignments in sync with the schedule: assign colors to newly added sections.
// Existing assignments are preserved (never reassigned), so deletions don't reshuffle the
// survivors' colors and switching schedules doesn't discard other schedules' assignments.
const syncAssignments = () => {
    const state = useSectionThemeStore.getState();
    state.ensureAssignments();
    // Keep the resolved active map current so the calendar, color strips, and color picker
    // all reflect newly added/removed sections (and the previewed theme) consistently.
    state.recomputeActiveAssignments();
};
AppStore.on('addedCoursesChange', syncAssignments);
AppStore.on('customEventsChange', syncAssignments);
AppStore.on('currentScheduleIndexChange', syncAssignments);
