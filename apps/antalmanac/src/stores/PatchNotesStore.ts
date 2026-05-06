import { getLocalStoragePatchNotesKey } from '$lib/localStorage';
import { tourShouldRun } from '$lib/TutorialHelpers';
import { differenceInCalendarDays, parse, startOfDay } from 'date-fns';
import { create } from 'zustand';

/**
 * Show modal only if the current patch notes haven't been shown.
 * This is denoted by a date string YYYYMMDD
 *
 * @example '20230819'
 */
export const LATEST_PATCH_NOTES_UPDATE = '20260130';

const PATCH_NOTES_ADDED_ON = parse(LATEST_PATCH_NOTES_UPDATE, 'yyyyMMdd', new Date());

/** Hide auto patch notes and the Patch Notes entry point after this many calendar days since release. */
const PATCH_NOTES_MAX_AGE_CALENDAR_DAYS = 30;

export function arePatchNotesStale(now: Date = new Date()) {
    return (
        differenceInCalendarDays(startOfDay(now), startOfDay(PATCH_NOTES_ADDED_ON)) > PATCH_NOTES_MAX_AGE_CALENDAR_DAYS
    );
}

export interface PatchNotesStoreProps {
    showPatchNotes: boolean;
    setShowPatchNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function shouldShowPatchNotes() {
    return (
        !arePatchNotesStale() &&
        getLocalStoragePatchNotesKey() !== LATEST_PATCH_NOTES_UPDATE &&
        !tourShouldRun()
    );
}

export const usePatchNotesStore = create<PatchNotesStoreProps>((set) => {
    return {
        showPatchNotes: shouldShowPatchNotes(),
        setShowPatchNotes: (value) =>
            set((state) => ({
                showPatchNotes: typeof value === 'function' ? value(state.showPatchNotes) : value,
            })),
    };
});
