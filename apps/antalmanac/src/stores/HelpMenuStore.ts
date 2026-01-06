import { create } from 'zustand';

import { tourShouldRun } from '$lib/TutorialHelpers';
import {
    getLocalStorageAboutBoxCollapseTime,
    getLocalStorageExpandAboutBox,
    getLocalStorageHelpBoxDismissalTime,
    getLocalStoragePatchNotesKey,
} from '$lib/localStorage';

/**
 * Active months: February/March for Spring planning, May/June for Fall planning, July/August for Summer planning,
 * and November/December for Winter planning
 */
const HELP_BOX_ACTIVE_MONTH_INDICES = [false, true, true, false, true, true, true, true, false, false, true, true];

/**
 * Show modal only if the current patch notes haven't been shown.
 * This is denoted by a date string YYYYMMDD
 *
 * @example '20230819'
 */
export const LATEST_PATCH_NOTES_UPDATE = '20250121';

export interface HelpMenuStoreProps {
    showHelpBox: boolean;
    setShowHelpBox: (value: boolean | ((prev: boolean) => boolean)) => void;

    expandAboutBox: boolean;
    toggleExpandAboutBox: () => void;

    showPatchNotes: boolean;
    setShowPatchNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function shouldShowPatchNotes() {
    return getLocalStoragePatchNotesKey() !== LATEST_PATCH_NOTES_UPDATE && !tourShouldRun();
}

function dismissedRecently(dismissalTime: string | null) {
    return dismissalTime !== null && Date.now() - parseInt(dismissalTime) < 30 * 24 * 3600 * 1000;
}

export const useHelpMenuStore = create<HelpMenuStoreProps>((set) => {
    const currentMonthIndex = new Date().getMonth();

    const helpBoxDismissalTime = getLocalStorageHelpBoxDismissalTime();
    const shouldShowHelpBox =
        !dismissedRecently(helpBoxDismissalTime) && !!HELP_BOX_ACTIVE_MONTH_INDICES.at(currentMonthIndex);

    const expandAboutBox = getLocalStorageExpandAboutBox() == 'true';
    const aboutBoxCollapseTime = getLocalStorageAboutBoxCollapseTime();
    const shouldExpandAboutBox = expandAboutBox || !dismissedRecently(aboutBoxCollapseTime);

    return {
        showHelpBox: shouldShowHelpBox,
        setShowHelpBox: (value) =>
            set((state) => ({
                showHelpBox: typeof value === 'function' ? value(state.showHelpBox) : value,
            })),

        expandAboutBox: shouldExpandAboutBox,
        toggleExpandAboutBox: () =>
            set((state) => ({
                expandAboutBox: !state.expandAboutBox,
            })),

        showPatchNotes: shouldShowPatchNotes(),
        setShowPatchNotes: (value) =>
            set((state) => ({
                showPatchNotes: typeof value === 'function' ? value(state.showPatchNotes) : value,
            })),
    };
});
