import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { getLocalStorageSectionColor, setLocalStorageSectionColor } from '$lib/localStorage';
import { isSectionColorSetting, type SectionColorSetting } from '$lib/sectionThemes';
import type { PostHog } from 'posthog-js/react';
import { create } from 'zustand';

interface SectionThemeStore {
    /** The persisted setting — what is saved and what the user "actually" chose. */
    sectionColor: SectionColorSetting;
    /**
     * Ephemeral preview override (used while the user hovers over options in the picker).
     * When null, the persisted `sectionColor` is in effect.
     */
    previewSectionColor: SectionColorSetting | null;
    setSectionColor: (value: SectionColorSetting, postHog?: PostHog) => void;
    setPreviewSectionColor: (value: SectionColorSetting | null) => void;
}

function readStoredSectionColor(): SectionColorSetting {
    const raw = getLocalStorageSectionColor();
    // Default new / existing users to 'custom' so their hand-picked colors are preserved.
    // The Settings menu lets them pick a preset whenever.
    return isSectionColorSetting(raw) ? raw : 'custom';
}

export const useSectionThemeStore = create<SectionThemeStore>((set) => ({
    sectionColor: readStoredSectionColor(),
    previewSectionColor: null,

    setSectionColor: (value, postHog) => {
        setLocalStorageSectionColor(value);
        set({ sectionColor: value, previewSectionColor: null });
        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CHANGE_SECTION_COLOR,
            customProps: { sectionColor: value },
        });
    },

    setPreviewSectionColor: (value) => set({ previewSectionColor: value }),
}));

/**
 * The section color setting currently in effect — preview (if hovering) or persisted otherwise.
 * Subscribe to this in components that render colored events; subscribe to `sectionColor`
 * directly for UI that should reflect the user's actual saved choice.
 */
export const selectActiveSectionColor = (s: SectionThemeStore): SectionColorSetting =>
    s.previewSectionColor ?? s.sectionColor;
