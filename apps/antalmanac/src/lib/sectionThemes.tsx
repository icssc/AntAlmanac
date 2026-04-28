import { resolveSectionColorPalette, sectionColorThemeDefinitions, type SectionColorPresetId } from '$lib/themes';

export type SectionThemePreset = SectionColorPresetId;

export interface SectionThemeOption {
    value: SectionThemePreset;
    label: string;
    description: string;
    author: string;
    icon: React.ReactNode;
    swatches: string[];
    previewRows: { label: string; color: string }[];
}

const PREVIEW_ROW_LABELS = ['STATS 67 Lec', 'ICS 6B Dis', 'ICS 33 Lec', 'WRITING 60 Sem'] as const;

export function getSectionThemeOptions(isDarkMode: boolean): SectionThemeOption[] {
    return sectionColorThemeDefinitions.map((def) => {
        const palette = resolveSectionColorPalette(def.id, isDarkMode);
        const families = Object.keys(palette);
        const swatches = families.map((f) => palette[f][0]);
        const previewRows = families.slice(0, PREVIEW_ROW_LABELS.length).map((f, i) => ({
            label: PREVIEW_ROW_LABELS[i] ?? `Section ${i + 1}`,
            color: palette[f][0],
        }));

        const ThemeIcon = def.icon;
        return {
            value: def.id,
            label: def.label,
            description: def.description,
            author: def.author,
            icon: <ThemeIcon fontSize="small" />,
            swatches,
            previewRows,
        };
    });
}
