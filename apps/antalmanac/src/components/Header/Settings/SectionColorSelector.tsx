import { SectionThemeDialog } from '$components/SectionTheme/SectionThemeDialog';
import { getPalette, SECTION_THEMES } from '$lib/sectionThemes';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Palette } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

export function SectionColorSelector() {
    const isDark = useThemeStore((s) => s.isDark);
    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const postHog = usePostHog();

    const [open, setOpen] = useState(false);

    const activeTheme = SECTION_THEMES.find((t) => t.id === sectionColor);
    const activeName = activeTheme?.name ?? 'Custom';
    const swatches = activeTheme ? getPalette(activeTheme.id, isDark).map((f) => f[0]) : [];

    return (
        <Stack gap={1}>
            <Typography variant="h6">Section Color</Typography>
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 80 }}>
                    {activeName}
                </Typography>
                {swatches.length > 0 && (
                    <Stack direction="row" gap={0.5}>
                        {swatches.map((c) => (
                            <Box
                                key={c}
                                sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 0.5,
                                    backgroundColor: c,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                        ))}
                    </Stack>
                )}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Palette fontSize="small" />}
                    onClick={() => setOpen(true)}
                    sx={{ ml: 'auto' }}
                >
                    Browse Themes
                </Button>
            </Stack>

            <SectionThemeDialog
                open={open}
                onClose={() => setOpen(false)}
                initialValue={sectionColor}
                description="Pick a preset theme, or choose Custom to set each section's color individually from the calendar."
                onApply={(value) => setSectionColor(value, postHog)}
            />
        </Stack>
    );
}
