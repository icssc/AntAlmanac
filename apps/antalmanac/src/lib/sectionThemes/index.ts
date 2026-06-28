import { isCustomEvent, isSkeletonEvent, type CalendarEvent } from '$components/Calendar/types';
import { scheduleOfferingKey, scheduleSectionKey } from '$stores/scheduleHelpers';
import type { AACourseWithTerm, AASection } from '@packages/antalmanac-types';

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

/* ------------------------------------------------------------------ *
 * Theme color assignments
 *
 * A preset theme assigns each course/custom-event a *palette slot* rather than a
 * concrete hex color, so the same assignment renders correctly in light and dark
 * mode. A slot is encoded as the string "family:variant" (e.g. "2:0"). A manual
 * per-section override is stored instead as a raw hex string (e.g. "#ff0000").
 *
 * Assignments are keyed by a stable section/custom-event key and persisted, so:
 *   - deleting a course never reshuffles the colors of the survivors, and
 *   - a manual tweak lives alongside the theme instead of overwriting the user's
 *     custom palette.
 * ------------------------------------------------------------------ */

/** Map of section key -> assignment (either an encoded palette slot or a "#hex" override). */
export type ThemeAssignmentMap = Record<string, string>;

interface PaletteSlot {
    family: number;
    variant: number;
}

function encodeSlot(slot: PaletteSlot): string {
    return `${slot.family}:${slot.variant}`;
}

function isManual(value: string): boolean {
    return value.startsWith('#');
}

function parseSlot(value: string): PaletteSlot | null {
    if (isManual(value)) return null;
    const [family, variant] = value.split(':').map(Number);
    if (Number.isNaN(family) || Number.isNaN(variant)) return null;
    return { family, variant };
}

/** Resolve a stored assignment value to a concrete hex color using the active palette. */
export function resolveAssignment(value: string, palette: readonly (readonly string[])[]): string {
    if (isManual(value)) return value;
    const slot = parseSlot(value);
    if (!slot) return palette[0][0];
    return palette[slot.family]?.[slot.variant] ?? palette[slot.family]?.[0] ?? palette[0][0];
}

export function customEventColorKey(customEventID: unknown): string {
    return `custom::${String(customEventID)}`;
}

/**
 * Choose a palette slot for a section, mirroring custom-color offering logic in
 * slot (index) space:
 *   1. Same offering + sectionType already assigned -> reuse that slot.
 *   2. Same offering, different sectionType -> same family, next unused variant.
 *   3. New offering -> next unused family (variant 0), wrapping when exhausted.
 */
interface AssignedSection {
    offeringKey: string;
    sectionType: string;
    sectionCode: string;
    slot: PaletteSlot;
}

function pickCourseSlot(
    offeringKey: string,
    section: AASection,
    assigned: AssignedSection[],
    palette: readonly (readonly string[])[]
): PaletteSlot {
    const sameType = assigned.find((a) => a.offeringKey === offeringKey && a.sectionType === section.sectionType);
    if (sameType) return sameType.slot;

    const sameCourse = assigned
        .filter((a) => a.offeringKey === offeringKey)
        .sort(
            (a, b) =>
                Math.abs(parseInt(a.sectionCode) - parseInt(section.sectionCode)) -
                Math.abs(parseInt(b.sectionCode) - parseInt(section.sectionCode))
        )[0];

    if (sameCourse) {
        const family = sameCourse.slot.family;
        const usedVariants = new Set(assigned.filter((a) => a.slot.family === family).map((a) => a.slot.variant));
        const variantCount = palette[family]?.length ?? 1;
        for (let v = 0; v < variantCount; v++) {
            if (!usedVariants.has(v)) return { family, variant: v };
        }
        return { family, variant: 0 };
    }

    const usedFamilies = new Set(assigned.map((a) => a.slot.family));
    for (let f = 0; f < palette.length; f++) {
        if (!usedFamilies.has(f)) return { family: f, variant: 0 };
    }
    return { family: assigned.length % palette.length, variant: 0 };
}

/**
 * Fill in assignments for any course / custom event that doesn't already have one,
 * preserving existing assignments (so survivors keep their colors) and dropping keys
 * for sections no longer present. Returns the next map and whether it changed.
 */
export function computeAssignments(
    previous: ThemeAssignmentMap,
    courses: readonly AACourseWithTerm[],
    customEventIds: readonly (string | number)[],
    palette: readonly (readonly string[])[]
): { map: ThemeAssignmentMap; changed: boolean } {
    const next: ThemeAssignmentMap = {};

    // Collect all section keys and carry over existing assignments.
    const courseKeys: string[] = [];
    for (const course of courses) {
        for (const section of course.sections) {
            courseKeys.push(scheduleSectionKey(course.term, section.sectionCode));
        }
    }
    const customKeys = customEventIds.map(customEventColorKey);

    for (const key of [...courseKeys, ...customKeys]) {
        if (previous[key] != null) next[key] = previous[key];
    }

    // Seed grouping/distinctness from carried-over palette assignments.
    const assigned: AssignedSection[] = [];
    for (const course of courses) {
        const offeringKey = scheduleOfferingKey(course);
        for (const section of course.sections) {
            const value = next[scheduleSectionKey(course.term, section.sectionCode)];
            const slot = value != null ? parseSlot(value) : null;
            if (slot) {
                assigned.push({
                    offeringKey,
                    sectionType: section.sectionType,
                    sectionCode: section.sectionCode,
                    slot,
                });
            }
        }
    }

    // Assign new slots for sections without existing assignments.
    for (const course of courses) {
        const offeringKey = scheduleOfferingKey(course);
        for (const section of course.sections) {
            const key = scheduleSectionKey(course.term, section.sectionCode);
            if (next[key] != null) continue;
            const slot = pickCourseSlot(offeringKey, section, assigned, palette);
            next[key] = encodeSlot(slot);
            assigned.push({ offeringKey, sectionType: section.sectionType, sectionCode: section.sectionCode, slot });
        }
    }

    // Custom events: one primary color each, cycling through unused families.
    customEventIds.forEach((id, index) => {
        const key = customEventColorKey(id);
        if (next[key] != null) return;
        const usedFamilies = new Set(
            Object.values(next)
                .map(parseSlot)
                .filter((s): s is PaletteSlot => s != null)
                .map((s) => s.family)
        );
        let family = -1;
        for (let f = 0; f < palette.length; f++) {
            if (!usedFamilies.has(f)) {
                family = f;
                break;
            }
        }
        if (family === -1) family = index % palette.length;
        next[key] = encodeSlot({ family, variant: 0 });
    });

    const prevKeys = Object.keys(previous);
    const nextKeys = Object.keys(next);
    const changed = prevKeys.length !== nextKeys.length || nextKeys.some((key) => previous[key] !== next[key]);

    return { map: next, changed };
}

/**
 * Apply a preset theme's assignments to calendar events without mutating the input.
 * `assignments` must already cover every current course/custom event (see
 * {@link computeAssignments}); missing keys fall back to the event's existing color.
 */
export function applyThemeToCalendarEvents<E extends CalendarEvent>(
    events: readonly E[],
    setting: SectionColorSetting,
    assignments: ThemeAssignmentMap,
    palette: readonly (readonly string[])[]
): E[] {
    if (setting === 'custom') return [...events];

    return events.map((event): E => {
        if (isSkeletonEvent(event)) return event;
        const key = isCustomEvent(event)
            ? customEventColorKey(event.customEventID)
            : scheduleSectionKey(event.term, event.sectionCode);
        const value = assignments[key];
        return value != null ? { ...event, color: resolveAssignment(value, palette) } : event;
    });
}
