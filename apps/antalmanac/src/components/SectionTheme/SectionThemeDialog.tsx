import { getPalette, SECTION_THEMES, type SectionColorSetting } from '$lib/sectionThemes';
import { useThemeStore } from '$stores/SettingsStore';
import { Check } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';

const PREVIEW_LABELS = ['STATS 67 Lec', 'ICS 6B Dis', 'WRITING 60 Sem'];

/**
 * W3C brightness check for choosing readable text on a colored background.
 * Returns false (use black text) on invalid input rather than throwing.
 */
function shouldUseWhiteText(bg: string): boolean {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg.slice(0, 7));
    if (!match) return false;
    const r = parseInt(match[1], 16);
    const g = parseInt(match[2], 16);
    const b = parseInt(match[3], 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // brightness(white) = 255 → diff > 125 means bg is dark enough for white text
    return 255 - brightness > 125;
}

interface ThemeOption {
    id: SectionColorSetting;
    name: string;
    /** Primary color per family. Empty for "custom". */
    swatches: string[];
}

function buildOptions(isDark: boolean): ThemeOption[] {
    const presets = SECTION_THEMES.map((t) => ({
        id: t.id as SectionColorSetting,
        name: t.name,
        swatches: getPalette(t.id, isDark).map((family) => family[0]),
    }));
    return [{ id: 'custom', name: 'Custom', swatches: [] }, ...presets];
}

interface ThemeCardProps {
    option: ThemeOption;
    selected: boolean;
    onSelect: () => void;
}

function ThemeCard({ option, selected, onSelect }: ThemeCardProps) {
    const muiTheme = useTheme();
    const accent = muiTheme.palette.primary.main;
    const previewColors = option.swatches.slice(0, PREVIEW_LABELS.length);

    return (
        <Box
            component="button"
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            sx={{
                position: 'relative',
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                appearance: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selected ? accent : 'divider',
                backgroundColor: selected ? muiTheme.palette.action.selected : muiTheme.palette.background.paper,
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': { borderColor: accent },
                '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={selected ? 700 : 600}>
                    {option.name}
                </Typography>
                {selected && <Check sx={{ color: accent, fontSize: 20 }} />}
            </Stack>

            {option.swatches.length > 0 ? (
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                    {option.swatches.map((c) => (
                        <Box
                            key={c}
                            sx={{ width: 18, height: 18, borderRadius: 0.5, backgroundColor: c, flexShrink: 0 }}
                        />
                    ))}
                </Stack>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Pick each section&apos;s color yourself by clicking the course on the calendar.
                </Typography>
            )}

            {previewColors.length > 0 && (
                <Stack
                    gap={0.5}
                    sx={{
                        mt: 0.5,
                        p: 0.75,
                        borderRadius: 0.75,
                        backgroundColor: muiTheme.palette.background.default,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {previewColors.map((color, i) => (
                        <Box
                            key={i}
                            sx={{
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5,
                                backgroundColor: color,
                                color: shouldUseWhiteText(color) ? '#fff' : '#000',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                userSelect: 'none',
                            }}
                        >
                            {PREVIEW_LABELS[i]}
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export interface SectionThemeDialogProps {
    open: boolean;
    onClose: () => void;
    /** Initial selection when the dialog opens. */
    initialValue: SectionColorSetting;
    /** Called when the user clicks the primary action button. */
    onApply: (value: SectionColorSetting) => void;
    title?: string;
    description?: ReactNode;
    /** Secondary action button shown to the left of "Apply Theme". */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Single shared dialog for picking a section color theme.
 * Used by both the Settings menu and the one-time onboarding flow.
 */
export function SectionThemeDialog({
    open,
    onClose,
    initialValue,
    onApply,
    title = 'Section Color Theme',
    description,
    secondaryAction,
}: SectionThemeDialogProps) {
    const isDark = useThemeStore((s) => s.isDark);
    const [pending, setPending] = useState<SectionColorSetting>(initialValue);

    // Reset selection each time the dialog opens.
    useEffect(() => {
        if (open) setPending(initialValue);
    }, [open, initialValue]);

    const options = buildOptions(isDark);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description}
                    </Typography>
                )}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                    }}
                >
                    {options.map((option) => (
                        <ThemeCard
                            key={option.id}
                            option={option}
                            selected={pending === option.id}
                            onSelect={() => setPending(option.id)}
                        />
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                {secondaryAction && (
                    <Button onClick={secondaryAction.onClick} color="inherit">
                        {secondaryAction.label}
                    </Button>
                )}
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        onApply(pending);
                        onClose();
                    }}
                    variant="contained"
                    color="primary"
                >
                    Apply Theme
                </Button>
            </DialogActions>
        </Dialog>
    );
}
