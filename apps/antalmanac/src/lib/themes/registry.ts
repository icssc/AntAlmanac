import { catppuccinTheme } from '$lib/themes/catppuccin';
import { defaultTheme } from '$lib/themes/defaultTheme';
import { legacyTheme } from '$lib/themes/legacyTheme';
import { quietLuxuryTheme } from '$lib/themes/quietLuxury';

export const sectionColorThemeDefinitions = [defaultTheme, legacyTheme, catppuccinTheme, quietLuxuryTheme] as const;

export type SectionColorPresetId = (typeof sectionColorThemeDefinitions)[number]['id'];
export type SectionColorSetting = SectionColorPresetId | 'custom';

export function isSectionColorSetting(value: unknown): value is SectionColorSetting {
    if (value === 'custom') {
        return true;
    }
    if (typeof value !== 'string') {
        return false;
    }
    return sectionColorThemeDefinitions.some((t) => t.id === value);
}

export const colorVariants: Record<SectionColorSetting, Record<string, string[]>> = {
    custom: defaultTheme.palette,
    default: defaultTheme.palette,
    legacy: legacyTheme.palette,
    catppuccin: catppuccinTheme.palette,
    quiet_luxury: quietLuxuryTheme.palette,
};

export function resolveSectionColorPalette(
    setting: SectionColorSetting,
    isDarkMode?: boolean
): Record<string, string[]> {
    if (setting === 'catppuccin') {
        const isDark = Boolean(isDarkMode);
        return isDark && catppuccinTheme.paletteDark ? catppuccinTheme.paletteDark : catppuccinTheme.palette;
    }
    return colorVariants[setting];
}
