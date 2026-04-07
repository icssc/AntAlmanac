import { Check, History, Palette, Pets } from '@mui/icons-material';
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
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { setLocalStorageSectionColorOnboarding } from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useHelpMenuStore } from '$stores/HelpMenuStore';
import { type SectionColorSetting, useSectionColorStore, useThemeStore } from '$stores/SettingsStore';
import { colorVariants } from '$stores/scheduleHelpers';

interface ThemeOption {
    value: SectionColorSetting;
    label: string;
    description: string;
    icon: React.ReactNode;
    swatches: string[];
    previewRows: { label: string; color: string }[];
}

const THEME_OPTIONS: ThemeOption[] = [
    {
        value: 'default',
        label: 'Default',
        description: 'Soft, gentle, pastels that are easy on the eyes.',
        icon: <Palette fontSize="small" />,
        swatches: [
            colorVariants.default.blue[0],
            colorVariants.default.pink[0],
            colorVariants.default.purple[0],
            colorVariants.default.green[0],
            colorVariants.default.amber[0],
            colorVariants.default.deepPurple[0],
            colorVariants.default.deepOrange[0],
        ],
        previewRows: [
            { label: 'CS 161 LEC', color: colorVariants.default.blue[0] },
            { label: 'MATH 2B DIS', color: colorVariants.default.pink[0] },
            { label: 'ICS 46 LEC', color: colorVariants.default.purple[0] },
            { label: 'WRITING 39C', color: colorVariants.default.green[0] },
        ],
    },
    {
        value: 'legacy',
        label: 'Legacy',
        description: 'The classic AntAlmanac palette: bold, saturated colors from the original app.',
        icon: <History fontSize="small" />,
        swatches: [
            colorVariants.legacy.blue[0],
            colorVariants.legacy.pink[0],
            colorVariants.legacy.purple[0],
            colorVariants.legacy.green[0],
            colorVariants.legacy.amber[0],
            colorVariants.legacy.deepPurple[0],
            colorVariants.legacy.deepOrange[0],
        ],
        previewRows: [
            { label: 'CS 161 LEC', color: colorVariants.legacy.blue[0] },
            { label: 'MATH 2B DIS', color: colorVariants.legacy.pink[0] },
            { label: 'ICS 46 LEC', color: colorVariants.legacy.purple[0] },
            { label: 'WRITING 39C', color: colorVariants.legacy.green[0] },
        ],
    },
    {
        value: 'catppuccin',
        label: 'Catppuccin',
        description: 'A warm, pastel color palette inspired by the popular Catppuccin theme.',
        icon: <Pets fontSize="small" />,
        swatches: [
            colorVariants.catppuccin.rosewater[0],
            colorVariants.catppuccin.flamingo[0],
            colorVariants.catppuccin.mauve[0],
            colorVariants.catppuccin.sapphire[0],
            colorVariants.catppuccin.lavender[0],
            colorVariants.catppuccin.maroon[0],
            colorVariants.catppuccin.teal[0],
        ],
        previewRows: [
            { label: 'CS 161 LEC', color: colorVariants.catppuccin.mauve[0] },
            { label: 'MATH 2B DIS', color: colorVariants.catppuccin.rosewater[0] },
            { label: 'ICS 46 LEC', color: colorVariants.catppuccin.sapphire[0] },
            { label: 'WRITING 39C', color: colorVariants.catppuccin.teal[0] },
        ],
    },
];

function Swatch({ color }: { color: string }) {
    return (
        <Box
            sx={{
                width: 18,
                height: 18,
                borderRadius: '3px',
                backgroundColor: color,
                flexShrink: 0,
            }}
        />
    );
}

function PreviewEventRow({ label, color }: { label: string; color: string }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: '4px',
                padding: '4px 6px',
                backgroundColor: color,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#333',
                letterSpacing: 0.2,
                userSelect: 'none',
            }}
        >
            {label}
        </Box>
    );
}

interface ThemeCardProps {
    option: ThemeOption;
    isSelected: boolean;
    isDark: boolean;
    onSelect: (value: SectionColorSetting) => void;
}

function ThemeCard({ option, isSelected, isDark, onSelect }: ThemeCardProps) {
    return (
        <Box
            onClick={() => onSelect(option.value)}
            role="button"
            aria-pressed={isSelected}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: `2px solid ${isSelected ? BLUE : isDark ? '#555' : '#d3d4d5'}`,
                backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#2a2a2a' : '#fafafa',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                    borderColor: isSelected ? BLUE : isDark ? '#888' : '#aaa',
                    backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#333' : '#f0f0f0',
                },
            }}
        >
            {/* Selected checkmark badge */}
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: BLUE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Check sx={{ fontSize: 14, color: '#fff' }} />
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ color: isSelected ? BLUE : 'text.secondary', display: 'flex', alignItems: 'center' }}>
                    {option.icon}
                </Box>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        color: isSelected ? BLUE : 'text.primary',
                        lineHeight: 1,
                    }}
                >
                    {option.label}
                </Typography>
            </Box>

            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.4,
                    minHeight: '2.8em',
                }}
            >
                {option.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {option.swatches.map((color, i) => (
                    <Swatch key={i} color={color} />
                ))}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    padding: '6px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
                }}
            >
                {option.previewRows.map((row, i) => (
                    <PreviewEventRow key={i} label={row.label} color={row.color} />
                ))}
            </Box>
        </Box>
    );
}

function OnboardingBackdrop(props: BackdropProps) {
    return <Backdrop {...props} data-testid={backdropTestId} />;
}

function SectionThemeOnboarding() {
    const [showSectionThemeOnboarding, setShowSectionThemeOnboarding] = useHelpMenuStore(
        useShallow((store) => [store.showSectionThemeOnboarding, store.setShowSectionThemeOnboarding])
    );

    const [sectionColor, setSectionColor] = useSectionColorStore(
        useShallow((store) => [store.sectionColor, store.setSectionColor])
    );

    const isDark = useThemeStore((store) => store.isDark);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();

    const muiTheme = useTheme();
    const isSmall = useMediaQuery(muiTheme.breakpoints.down('md'));

    const [pendingSelection, setPendingSelection] = useState<SectionColorSetting>(sectionColor);

    const handleKeepCustom = useCallback(() => {
        setLocalStorageSectionColorOnboarding('seen');
        setShowSectionThemeOnboarding(false);
    }, [setShowSectionThemeOnboarding]);

    const handleApply = useCallback(() => {
        if (pendingSelection !== sectionColor) {
            forceUpdate();
            setSectionColor(pendingSelection, postHog);
        }
        setLocalStorageSectionColorOnboarding('seen');
        setShowSectionThemeOnboarding(false);
    }, [pendingSelection, sectionColor, forceUpdate, setSectionColor, postHog, setShowSectionThemeOnboarding]);

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={showSectionThemeOnboarding}
            onClose={handleKeepCustom}
            data-testid={dialogTestId}
            slots={{ backdrop: OnboardingBackdrop }}
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                },
            }}
        >
            <DialogTitle sx={{ pb: 0.5 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Palette sx={{ color: BLUE }} />
                    <Typography variant="h6" fontWeight={700} component="span">
                        New Feature: Section Themes
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5}>
                    <Typography variant="body2" color="text.secondary">
                        AntAlmanac now supports multiple color themes for your calendar sections. Pick the palette that
                        fits your style, or skip to keep your individually customized section colors.{' '}
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: isSmall ? '1fr' : 'repeat(3, 1fr)',
                            gap: 1.5,
                        }}
                    >
                        {THEME_OPTIONS.map((option) => (
                            <ThemeCard
                                key={option.value}
                                option={option}
                                isSelected={pendingSelection === option.value}
                                isDark={isDark}
                                onSelect={setPendingSelection}
                            />
                        ))}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        You can always change your theme later in <strong>Settings → Section Color</strong>.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
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
                    Apply {THEME_OPTIONS.find((o) => o.value === pendingSelection)?.label} Theme
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
