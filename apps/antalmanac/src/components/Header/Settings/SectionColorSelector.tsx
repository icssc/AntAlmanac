import { getPalette, SECTION_THEMES, type SectionColorSetting, type SectionThemeId } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Check, ExpandMore } from '@mui/icons-material';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useMemo, useRef, useState } from 'react';

interface ThemeOption {
    id: SectionColorSetting;
    name: string;
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

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const setPreviewSectionColor = useSectionThemeStore((s) => s.setPreviewSectionColor);
    const resetTheme = useSectionThemeStore((s) => s.resetTheme);
    const assignmentsByTheme = useSectionThemeStore((s) => s.assignments);
    const postHog = usePostHog();

    const buttonRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const options = useMemo<ThemeOption[]>(
        () => [
            { id: 'custom', name: 'Custom', swatches: getCustomSwatches(isDark) },
            ...SECTION_THEMES.map((t) => ({
                id: t.id,
                name: t.name,
                swatches: getPalette(t.id, isDark)
                    .map((family) => family[0])
                    .slice(0, 4),
            })),
        ],
        [isDark]
    );

    const activeOption = options.find((o) => o.id === sectionColor);
    const activeName = activeOption?.name ?? 'Custom';

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
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: muiTheme.palette.secondary.main }}>
                    {activeName}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                    {activeOption && <Swatches colors={activeOption.swatches} />}
                    <ExpandMore fontSize="small" sx={{ color: muiTheme.palette.secondary.main }} />
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
                            onMouseEnter={() => setPreviewSectionColor(option.id)}
                            onFocus={() => setPreviewSectionColor(option.id)}
                            onMouseLeave={() => setPreviewSectionColor(null)}
                            onClick={() => handleSelect(option.id)}
                        >
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                {isSelected ? <Check fontSize="small" /> : null}
                            </ListItemIcon>
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
                    sx={{ alignSelf: 'flex-start', textTransform: 'none', color: 'text.secondary', px: 0.5 }}
                >
                    Reset customized colors
                </Button>
            )}
        </Box>
    );
}
