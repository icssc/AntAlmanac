import { getPalette, SECTION_THEMES, type SectionColorSetting, type SectionThemeId } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import {
    Check,
    Colorize,
    Diamond,
    ExpandMore,
    Gradient,
    History,
    Palette,
    Pets,
    type SvgIconComponent,
} from '@mui/icons-material';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useMemo, useRef, useState } from 'react';

/** A representative MUI icon for each theme (presentational only — kept out of the palette data). */
const THEME_ICONS: Record<SectionColorSetting, SvgIconComponent> = {
    default: Palette,
    legacy: History,
    pastel: Gradient,
    catppuccin: Pets,
    quietLuxury: Diamond,
    custom: Colorize,
};

interface ThemeOption {
    id: SectionColorSetting;
    name: string;
    icon: SvgIconComponent;
    swatches: string[];
}

/** Swatches for "Custom" = the distinct colors the user currently has in their schedule. */
function getCustomSwatches(isDark: boolean): string[] {
    const distinct = [...new Set(AppStore.schedule.getCurrentCourses().map((c) => c.section.color))];
    if (distinct.length > 0) return distinct.slice(0, 4);
    return getPalette('default', isDark)
        .map((family) => family[0])
        .slice(0, 4);
}

function Swatches({ colors }: { colors: string[] }) {
    const theme = useTheme();
    if (colors.length === 0) return null;
    return (
        <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
            {colors.map((c) => (
                <Box
                    key={c}
                    sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '3px',
                        backgroundColor: c,
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                />
            ))}
        </Stack>
    );
}

/**
 * Settings entry for picking the section color theme.
 *
 * Mirrors AntAlmanac's other Settings selectors (label on top, control below) and matches
 * issue #1720: a dropdown that live-previews each theme on the actual calendar as the user
 * hovers, committing on click and reverting on dismiss. No modal.
 */
export function SectionColorSelector() {
    const muiTheme = useTheme();
    const isDark = useThemeStore((s) => s.isDark);
    const accent = muiTheme.palette.secondary.main;

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const setPreviewSectionColor = useSectionThemeStore((s) => s.setPreviewSectionColor);
    const resetTheme = useSectionThemeStore((s) => s.resetTheme);
    const assignmentsByTheme = useSectionThemeStore((s) => s.assignments);
    const postHog = usePostHog();

    const buttonRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Presets first, "Custom" last.
    const options = useMemo<ThemeOption[]>(
        () => [
            ...SECTION_THEMES.map((t) => ({
                id: t.id,
                name: t.name,
                icon: THEME_ICONS[t.id] ?? Palette,
                swatches: getPalette(t.id, isDark)
                    .map((family) => family[0])
                    .slice(0, 4),
            })),
            { id: 'custom' as const, name: 'Custom', icon: THEME_ICONS.custom, swatches: getCustomSwatches(isDark) },
        ],
        [isDark]
    );

    const activeOption = options.find((o) => o.id === sectionColor) ?? options[options.length - 1];
    const ActiveIcon = activeOption.icon;

    // Whether the active preset theme has any per-section overrides to reset.
    const hasOverrides =
        sectionColor !== 'custom' &&
        Object.values(assignmentsByTheme[sectionColor] ?? {}).some((value) => value.startsWith('#'));

    const handleClose = useCallback(() => {
        setMenuOpen(false);
        setPreviewSectionColor(null);
    }, [setPreviewSectionColor]);

    const handleSelect = useCallback(
        (value: SectionColorSetting) => {
            setSectionColor(value, postHog);
            setMenuOpen(false);
        },
        [setSectionColor, postHog]
    );

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Section Color
            </Typography>

            <Box
                ref={buttonRef}
                onClick={() => setMenuOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setMenuOpen(true);
                    }
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    padding: '8px 12px',
                    border: `1px solid ${muiTheme.palette.divider}`,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: muiTheme.palette.settingsSegment.background,
                    '&:hover': { backgroundColor: muiTheme.palette.settingsSegment.hoverBackground },
                }}
            >
                <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                    <ActiveIcon fontSize="medium" sx={{ color: accent }} />
                    <Typography noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: accent }}>
                        {activeOption.name}
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Swatches colors={activeOption.swatches} />
                    <ExpandMore fontSize="small" sx={{ color: accent }} />
                </Stack>
            </Box>

            <Menu
                anchorEl={buttonRef.current}
                open={menuOpen}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ paper: { sx: { width: buttonRef.current?.offsetWidth, maxHeight: 320 } } }}
            >
                {options.map((option) => {
                    const isSelected = option.id === sectionColor;
                    const OptionIcon = option.icon;
                    return (
                        <MenuItem
                            key={option.id}
                            selected={isSelected}
                            onMouseEnter={() => setPreviewSectionColor(option.id)}
                            onFocus={() => setPreviewSectionColor(option.id)}
                            onMouseLeave={() => setPreviewSectionColor(null)}
                            onClick={() => handleSelect(option.id)}
                        >
                            <ListItemIcon sx={{ minWidth: 32, color: isSelected ? accent : 'inherit' }}>
                                <OptionIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={option.name}
                                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                            />
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Swatches colors={option.swatches} />
                                <Check
                                    sx={{ fontSize: 18, color: accent, visibility: isSelected ? 'visible' : 'hidden' }}
                                />
                            </Stack>
                        </MenuItem>
                    );
                })}
            </Menu>

            {hasOverrides && (
                <Button
                    size="small"
                    color="inherit"
                    onClick={() => resetTheme(sectionColor as SectionThemeId)}
                    sx={{ alignSelf: 'flex-start', textTransform: 'none', color: 'text.secondary', px: 0.5 }}
                >
                    Reset customized colors
                </Button>
            )}
        </Box>
    );
}
