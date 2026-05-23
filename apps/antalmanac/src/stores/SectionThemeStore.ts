import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import {
    getLocalStorageSectionColor,
    getLocalStorageSectionColorOnboarding,
    setLocalStorageSectionColor,
    setLocalStorageSectionColorOnboarding,
} from '$lib/localStorage';
import { isSectionColorSetting, type SectionColorSetting } from '$lib/sectionThemes';
import { tourShouldRun } from '$lib/TutorialHelpers';
import type { PostHog } from 'posthog-js/react';
import { create } from 'zustand';

interface SectionThemeStore {
    sectionColor: SectionColorSetting;
    setSectionColor: (value: SectionColorSetting, postHog?: PostHog) => void;

    /** Whether the one-time onboarding dialog is currently open. */
    onboardingOpen: boolean;
    /** Permanently dismiss the onboarding dialog. */
    dismissOnboarding: () => void;
}

function readStoredSectionColor(): SectionColorSetting {
    const raw = getLocalStorageSectionColor();
    // If the user has never picked a theme, default them to "custom" so their existing
    // hand-picked colors are preserved. The onboarding flow lets them choose otherwise.
    return isSectionColorSetting(raw) ? raw : 'custom';
}

function shouldShowOnboarding() {
    return getLocalStorageSectionColorOnboarding() == null && !tourShouldRun();
}

export const useSectionThemeStore = create<SectionThemeStore>((set) => ({
    sectionColor: readStoredSectionColor(),
    onboardingOpen: shouldShowOnboarding(),

    setSectionColor: (value, postHog) => {
        setLocalStorageSectionColor(value);
        set({ sectionColor: value });
        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CHANGE_SECTION_COLOR,
            customProps: { sectionColor: value },
        });
    },

    dismissOnboarding: () => {
        setLocalStorageSectionColorOnboarding('seen');
        set({ onboardingOpen: false });
    },
}));
