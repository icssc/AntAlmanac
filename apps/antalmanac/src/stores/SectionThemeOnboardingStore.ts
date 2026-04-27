import { create } from 'zustand';

import { tourShouldRun } from '$lib/TutorialHelpers';
import { getLocalStorageSectionColorOnboarding } from '$lib/localStorage';

export interface SectionThemeOnboardingStoreProps {
    showSectionThemeOnboarding: boolean;
    setShowSectionThemeOnboarding: (value: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Show the section theme onboarding dialog only once — when the user has never seen it before.
 * We track this by storing a truthy value in localStorage after dismissal.
 */
export function shouldShowSectionThemeOnboarding() {
    return getLocalStorageSectionColorOnboarding() === null && !tourShouldRun();
}

export const useSectionThemeOnboardingStore = create<SectionThemeOnboardingStoreProps>((set) => {
    return {
        showSectionThemeOnboarding: shouldShowSectionThemeOnboarding(),
        setShowSectionThemeOnboarding: (value) =>
            set((state) => ({
                showSectionThemeOnboarding:
                    typeof value === 'function' ? value(state.showSectionThemeOnboarding) : value,
            })),
    };
});
