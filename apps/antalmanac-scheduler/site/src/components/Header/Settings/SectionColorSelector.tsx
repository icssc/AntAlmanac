import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { SECTION_THEMES, type SectionColorSetting, type SectionThemeId, getPalette } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
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
import { Box, Button, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useRef, useState } from 'react';

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
    const distinct = [...new Set(AppStore.schedule.getCurrentCourses().flatMap((c) => c.sections.map((s) => s.color)))];
    if (distinct.length > 0) return distinct.slice(0, 4);
    return getPalette('default', isDark)
        .map((family) => family[0])
        .slice(0, 4);
}

function Swatches({ colors }: { colors: string[] }) {
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
                        border: 1,
                        borderColor: (theme) => theme.vars.palette.divider,
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
    const isDark = useIsDarkMode();

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const setPreviewSectionColor = useSectionThemeStore((s) => s.setPreviewSectionColor);
    const resetTheme = useSectionThemeStore((s) => s.resetTheme);
    const assignmentsByTheme = useSectionThemeStore((s) => s.assignments);
    const postHog = usePostHog();

    const buttonRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    // Synchronous mirror of `menuOpen` used to gate hover previews. MUI keeps menu items mounted
    // (and firing mouse events) during the close animation, so a stray `onMouseEnter` from a
    // continuing swipe can set a preview *after* a selection commits — with no matching
    // `onMouseLeave` to clear it — leaving the colors and the selected theme mismatched. Reading
    // a ref avoids the stale-closure problem a state value would have here.
    const menuOpenRef = useRef(false);

    // Presets first, "Custom" last. Computed each render (not memoized) so the Custom
    // swatches reflect the user's current schedule colors rather than going stale.
    const options: ThemeOption[] = [
        ...SECTION_THEMES.map((t) => ({
            id: t.id,
            name: t.name,
            icon: THEME_ICONS[t.id] ?? Palette,
            swatches: getPalette(t.id, isDark)
                .map((family) => family[0])
                .slice(0, 4),
        })),
        { id: 'custom' as const, name: 'Custom', icon: THEME_ICONS.custom, swatches: getCustomSwatches(isDark) },
    ];

    const activeOption = options.find((o) => o.id === sectionColor) ?? options[options.length - 1];
    const ActiveIcon = activeOption.icon;

    // Whether the active preset theme has any per-section overrides to reset.
    const hasOverrides =
        sectionColor !== 'custom' &&
        Object.values(assignmentsByTheme[sectionColor] ?? {}).some((value) => value.startsWith('#'));

    const openMenu = useCallback(() => {
        menuOpenRef.current = true;
        setMenuOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        menuOpenRef.current = false;
        setMenuOpen(false);
        setPreviewSectionColor(null);
    }, [setPreviewSectionColor]);

    const handleSelect = useCallback(
        (value: SectionColorSetting) => {
            // Close (and stop accepting previews) before committing so a stray hover from the
            // closing menu can't re-preview a different theme on top of the selection.
            menuOpenRef.current = false;
            setMenuOpen(false);
            setSectionColor(value, postHog);
            setPreviewSectionColor(null);
        },
        [setSectionColor, setPreviewSectionColor, postHog]
    );

    // Preview a theme on hover/focus, but only while the menu is genuinely open.
    const handlePreview = useCallback(
        (value: SectionColorSetting) => {
            if (!menuOpenRef.current) return;
            setPreviewSectionColor(value);
        },
        [setPreviewSectionColor]
    );

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Section Color
            </Typography>

            <Box
                ref={buttonRef}
                onClick={openMenu}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openMenu();
                    }
                }}
                sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    // Match the Theme selector's height: medium icon (24px) + 8px padding + 1px border.
                    minHeight: 42,
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    border: 1,
                    borderColor: theme.vars.palette.divider,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: theme.vars.palette.settingsSegment.background,
                    '&:hover': { backgroundColor: theme.vars.palette.settingsSegment.hoverBackground },
                })}
            >
                <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                    <ActiveIcon fontSize="medium" sx={{ color: (theme) => theme.vars.palette.secondary.main }} />
                    <Typography
                        noWrap
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            color: (theme) => theme.vars.palette.secondary.main,
                        }}
                    >
                        {activeOption.name}
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Swatches colors={activeOption.swatches} />
                    <ExpandMore fontSize="small" sx={{ color: (theme) => theme.vars.palette.secondary.main }} />
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
                    return (
                        <MenuItem
                            key={option.id}
                            selected={isSelected}
                            onMouseEnter={() => handlePreview(option.id)}
                            onFocus={() => handlePreview(option.id)}
                            onMouseLeave={() => setPreviewSectionColor(null)}
                            onClick={() => handleSelect(option.id)}
                            sx={{ gap: 1 }}
                        >
                            <Check
                                sx={{
                                    fontSize: 18,
                                    color: (theme) => theme.vars.palette.secondary.main,
                                    flexShrink: 0,
                                    visibility: isSelected ? 'visible' : 'hidden',
                                }}
                            />
                            <ListItemText
                                primary={option.name}
                                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                            />
                            <Swatches colors={option.swatches} />
                        </MenuItem>
                    );
                })}
            </Menu>

            {hasOverrides && (
                <Button
                    size="small"
                    color="inherit"
                    onClick={() => resetTheme(sectionColor as SectionThemeId)}
                    sx={{
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        color: (theme) => theme.vars.palette.text.secondary,
                        px: 0.5,
                    }}
                >
                    Restore Theme Colors
                </Button>
            )}
        </Box>
    );
}
