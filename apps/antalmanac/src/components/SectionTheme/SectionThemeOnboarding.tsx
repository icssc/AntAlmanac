import { SectionThemeDialog } from '$components/SectionTheme/SectionThemeDialog';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
import { usePostHog } from 'posthog-js/react';

/**
 * One-time dialog shown to existing users introducing section color themes.
 * Mounted by `Home`; gates itself on `localStorage` so it only opens once.
 */
export function SectionThemeOnboarding() {
    const onboardingOpen = useSectionThemeStore((s) => s.onboardingOpen);
    const dismissOnboarding = useSectionThemeStore((s) => s.dismissOnboarding);
    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const postHog = usePostHog();

    return (
        <SectionThemeDialog
            open={onboardingOpen}
            onClose={dismissOnboarding}
            initialValue={sectionColor}
            title="New: Section Color Themes"
            description="AntAlmanac now supports color themes for your schedule. Pick one, or keep your own custom colors. You can change this anytime in Settings."
            secondaryAction={{
                label: 'Keep Custom Colors',
                onClick: () => {
                    setSectionColor('custom', postHog);
                    dismissOnboarding();
                },
            }}
            onApply={(value) => {
                setSectionColor(value, postHog);
                dismissOnboarding();
            }}
        />
    );
}
