import { History, Palette, Pets } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

import { BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import {
    type SectionColorSetting,
    useSectionColorStore,
    useThemeStore,
} from '$stores/SettingsStore';

const SECTION_COLOR_OPTIONS: { value: SectionColorSetting; label: string; icon: React.ReactNode }[] = [
    { value: 'default', label: 'Default', icon: <Palette fontSize="small" /> },
    { value: 'legacy', label: 'Legacy', icon: <History fontSize="small" /> },
    { value: 'catppuccin', label: 'Catppuccin', icon: <Pets fontSize="small" /> },
];

export function SectionColorSelector() {
    const [sectionColor, setSectionColor] = useSectionColorStore((store) => [
        store.sectionColor,
        store.setSectionColor,
    ]);
    const isDark = useThemeStore((store) => store.isDark);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();

    const handleSectionColorChange = (value: SectionColorSetting) => {
        forceUpdate();
        setSectionColor(value, postHog);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Section Color
            </Typography>
            <Stack
                spacing={1}
                sx={{
                    width: '100%',
                    border: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                    borderRadius: '4px',
                    padding: '4px',
                }}
            >
                {SECTION_COLOR_OPTIONS.map((opt) => {
                    const isSelected = sectionColor === opt.value;
                    return (
                        <Box
                            key={opt.value}
                            onClick={() => handleSectionColorChange(opt.value)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                backgroundColor: isSelected ? BLUE : isDark ? '#333333' : '#f8f9fa',
                                color: isSelected ? '#fff' : BLUE,
                                '&:hover': {
                                    backgroundColor: isSelected ? BLUE : isDark ? '#424649' : '#d3d4d5',
                                },
                            }}
                        >
                            {opt.icon}
                            {opt.label}
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
}
