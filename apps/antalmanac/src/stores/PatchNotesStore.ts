import { getLocalStoragePatchNotesKey } from '$lib/localStorage';
import { tourShouldRun } from '$lib/TutorialHelpers';
import { create } from 'zustand';

/**
 * Show modal only if the current patch notes haven't been shown.
 * This is denoted by a date string YYYYMMDD
 *
 * @example '20230819'
 */
export const LATEST_PATCH_NOTES_UPDATE = '20260130';

export interface PatchNotesStoreProps {
    showPatchNotes: boolean;
    setShowPatchNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function shouldShowPatchNotes() {
    return getLocalStoragePatchNotesKey() !== LATEST_PATCH_NOTES_UPDATE && !tourShouldRun();
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
