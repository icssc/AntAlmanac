import {
    courseColorKey,
    customEventColorKey,
    getPalette,
    resolveAssignment,
    type SectionColorSetting,
    type ThemeAssignmentMap,
} from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import type { AATerm, CustomEventId } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';

const EMPTY_ASSIGNMENTS: ThemeAssignmentMap = {};

export interface SectionDisplayColorParams {
    term?: AATerm;
    sectionCode?: string;
    customEventID?: CustomEventId;
    fallbackColor: string;
}

export function resolveSectionDisplayColor({
    term,
    sectionCode,
    customEventID,
    fallbackColor,
    setting,
    assignments,
    palette,
}: SectionDisplayColorParams & {
    setting: SectionColorSetting;
    assignments: ThemeAssignmentMap;
    palette: readonly (readonly string[])[];
}): string {
    if (customEventID != null) {
        if (setting !== 'custom') {
            const value = assignments[customEventColorKey(customEventID)];
            if (value != null) {
                return resolveAssignment(value, palette);
            }
        }
        return AppStore.schedule.getExistingCustomEvent(customEventID)?.color ?? fallbackColor;
    }

    if (sectionCode != null && term != null) {
        const course = AppStore.schedule.getExistingCourseInSchedule(sectionCode, term);
        if (!course) {
            return fallbackColor;
        }
        if (setting === 'custom') {
            return course.section.color;
        }
        const value = assignments[courseColorKey(term, sectionCode)];
        return value != null ? resolveAssignment(value, palette) : course.section.color;
    }

    return fallbackColor;
}

/** Bump when schedule data or colors change so consumers re-read AppStore. */
function useSectionColorRevision(): number {
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const bump = () => setRevision((value) => value + 1);

        AppStore.on('addedCoursesChange', bump);
        AppStore.on('customEventsChange', bump);
        AppStore.on('currentScheduleIndexChange', bump);
        AppStore.on('colorChange', bump);

        return () => {
            AppStore.removeListener('addedCoursesChange', bump);
            AppStore.removeListener('customEventsChange', bump);
            AppStore.removeListener('currentScheduleIndexChange', bump);
            AppStore.removeListener('colorChange', bump);
        };
    }, []);

    return revision;
}

/**
 * Resolved swatch color for a course section or custom event.
 * Reads the same sources as the calendar and section-table strips, so every
 * color UI stays in sync without per-component AppStore registration.
 */
export function useSectionDisplayColor(params: SectionDisplayColorParams): string {
    const activeSectionColor = useSectionThemeStore(selectActiveSectionColor);
    const activeAssignments = useSectionThemeStore((s) => s.activeAssignments);
    const isDark = useThemeStore((s) => s.isDark);
    const revision = useSectionColorRevision();

    const { term, sectionCode, customEventID, fallbackColor } = params;

    return useMemo(
        () =>
            resolveSectionDisplayColor({
                term,
                sectionCode,
                customEventID,
                fallbackColor,
                setting: activeSectionColor,
                assignments: activeSectionColor === 'custom' ? EMPTY_ASSIGNMENTS : activeAssignments,
                palette: getPalette(activeSectionColor, isDark),
            }),
        [term, sectionCode, customEventID, fallbackColor, activeSectionColor, activeAssignments, isDark, revision]
    );
}
