import { SectionThemeGrid } from '$components/SectionTheme/SectionThemeGrid';
import { setLocalStorageSectionColorOnboarding } from '$lib/localStorage';
import { getSectionThemeOptions } from '$lib/sectionThemes';
import { type SectionColorSetting } from '$lib/themes';
import { BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSectionThemeOnboardingStore } from '$stores/SectionThemeOnboardingStore';
import { useSectionColorStore, useThemeStore } from '$stores/SettingsStore';
import { Palette } from '@mui/icons-material';
import {
    Backdrop,
    Box,
    type BackdropProps,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

function OnboardingBackdrop(props: BackdropProps) {
    return <Backdrop {...props} data-testid={backdropTestId} />;
}

function SectionThemeOnboarding() {
    const [showSectionThemeOnboarding, setShowSectionThemeOnboarding] = useSectionThemeOnboardingStore(
        useShallow((store) => [store.showSectionThemeOnboarding, store.setShowSectionThemeOnboarding])
    );

    const [sectionColor, setSectionColor] = useSectionColorStore(
        useShallow((store) => [store.sectionColor, store.setSectionColor])
    );

    const isDark = useThemeStore((store) => store.isDark);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();
    const muiTheme = useTheme();

    const themeOptions = useMemo(() => getSectionThemeOptions(isDark), [isDark]);

    const [pendingSelection, setPendingSelection] = useState<SectionColorSetting>(() => sectionColor);

    useEffect(() => {
        if (!showSectionThemeOnboarding) {
            return;
        }
        setPendingSelection(sectionColor);
    }, [showSectionThemeOnboarding, sectionColor]);

    const handleKeepCustom = useCallback(() => {
        setSectionColor('custom', postHog);
        setLocalStorageSectionColorOnboarding('seen');
        setShowSectionThemeOnboarding(false);
    }, [setSectionColor, postHog, setShowSectionThemeOnboarding]);

    const handleApply = useCallback(() => {
        if (pendingSelection !== sectionColor) {
            forceUpdate();
            setSectionColor(pendingSelection, postHog);
        }
        setLocalStorageSectionColorOnboarding('seen');
        setShowSectionThemeOnboarding(false);
    }, [pendingSelection, sectionColor, forceUpdate, setSectionColor, postHog, setShowSectionThemeOnboarding]);

    const selectedLabel =
        pendingSelection === 'custom'
            ? 'Custom'
            : (themeOptions.find((o) => o.value === pendingSelection)?.label ?? '');

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={showSectionThemeOnboarding}
            onClose={handleKeepCustom}
            data-testid={dialogTestId}
            slots={{ backdrop: OnboardingBackdrop }}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '12px',
                        maxHeight: 'min(88vh, 820px)',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                },
            }}
        >
            <DialogTitle sx={{ pb: 1, flexShrink: 0, pt: 2.5, px: 3 }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                    <Palette sx={{ color: BLUE, fontSize: 28 }} />
                    <Typography
                        component="h2"
                        variant="h5"
                        fontWeight={700}
                        sx={{ lineHeight: 1.3, letterSpacing: '-0.02em' }}
                    >
                        New Feature: Section Themes
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent
                sx={{ pt: 0, flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', px: 3 }}
            >
                <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: '1rem' }}>
                        AntAlmanac now supports multiple color themes for your calendar sections. Pick the palette that
                        fits your style, or skip to keep your individually customized section colors.
                    </Typography>

                    <Box
                        sx={{
                            overflow: 'auto',
                            flex: '1 1 auto',
                            minHeight: 0,
                            pr: 0.5,
                            mr: muiTheme.spacing(-0.5),
                        }}
                    >
                        <SectionThemeGrid
                            options={themeOptions}
                            selectedValue={pendingSelection}
                            isDark={isDark}
                            compact={false}
                            onSelect={setPendingSelection}
                        />
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                        You can always change your theme later in{' '}
                        <strong>Settings → Section Color → Browse Themes</strong>.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexShrink: 0 }}>
                <Button
                    onClick={handleKeepCustom}
                    variant="text"
                    color="inherit"
                    data-testid={keepCustomButtonTestId}
                    sx={{ color: 'text.secondary' }}
                >
                    Keep Custom Colors
                </Button>

                <Button
                    onClick={handleApply}
                    variant="contained"
                    data-testid={applyButtonTestId}
                    sx={{
                        backgroundColor: BLUE,
                        '&:hover': { backgroundColor: '#254ca0' },
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Apply {selectedLabel} Theme
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export { SectionThemeOnboarding };
export default SectionThemeOnboarding;

export const dialogTestId = 'section-theme-onboarding-dialog';
export const backdropTestId = 'section-theme-onboarding-backdrop';
export const applyButtonTestId = 'section-theme-onboarding-apply';
export const keepCustomButtonTestId = 'section-theme-onboarding-keep-custom';
