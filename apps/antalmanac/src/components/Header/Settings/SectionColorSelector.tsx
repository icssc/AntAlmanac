import { SectionThemePickerModal } from '$components/SectionTheme/SectionThemePickerModal';
import { getSectionThemeOptions } from '$lib/sectionThemes';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useSectionColorStore, useThemeStore } from '$stores/SettingsStore';
import { Palette } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePostHog } from 'posthog-js/react';
import { useMemo, useState } from 'react';

const PICKER_DESCRIPTION =
    "Choose a preset theme or create your own theme by selecting the Custom Theme option. With Custom Theme, set each section's color by clicking on a course on the calendar.";

export function SectionColorSelector() {
    const muiTheme = useTheme();
    const borderColor = muiTheme.palette.divider;
    const isDark = useThemeStore((s) => s.isDark);
    const accent = isDark ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main;

    const [sectionColor, setSectionColor] = useSectionColorStore((store) => [
        store.sectionColor,
        store.setSectionColor,
    ]);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();

    const [pickerOpen, setPickerOpen] = useState(false);
    const themeOptions = useMemo(() => getSectionThemeOptions(isDark), [isDark]);
    const currentPresetMeta =
        sectionColor !== 'custom' ? themeOptions.find((o) => o.value === sectionColor) : undefined;

    const isCustom = sectionColor === 'custom';
    const activeLabel = isCustom ? 'Custom' : (currentPresetMeta?.label ?? sectionColor);

    const actionButtonSx = {
        textTransform: 'none' as const,
        fontWeight: 700,
        fontSize: '1.1rem',
        py: 1,
        borderRadius: '4px',
        ...(!isDark ? { borderColor } : {}),
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Section Color
            </Typography>

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1.5}
                sx={{
                    width: '100%',
                    minHeight: 48,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                    px: 1.5,
                    py: 1,
                    bgcolor: 'action.hover',
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                        minWidth: 0,
                    }}
                >
                    {activeLabel}
                </Typography>
                {!isCustom && currentPresetMeta ? (
                    <Stack
                        direction="row"
                        gap={0.5}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ flexWrap: 'wrap', flexShrink: 0 }}
                    >
                        {currentPresetMeta.swatches.slice(0, 8).map((c, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '3px',
                                    bgcolor: c,
                                    border: `1px solid ${muiTheme.palette.divider}`,
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </Stack>
                ) : null}
            </Stack>

            {isCustom ? (
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    Set each color from the course block on the calendar.
                </Typography>
            ) : null}

            <Button
                fullWidth
                variant="outlined"
                color={isDark ? 'secondary' : 'primary'}
                onClick={() => setPickerOpen(true)}
                sx={actionButtonSx}
                startIcon={<Palette fontSize="small" />}
            >
                Browse Themes
            </Button>

            <SectionThemePickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                sectionColor={sectionColor}
                title="Section Themes"
                description={PICKER_DESCRIPTION}
                onApply={(setting) => {
                    forceUpdate();
                    setSectionColor(setting, postHog);
                }}
            />
        </Box>
    );
}
