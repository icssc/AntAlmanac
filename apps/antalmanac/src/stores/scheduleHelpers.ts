import {
    amber,
    brown,
    blue,
    cyan,
    deepOrange,
    deepPurple,
    green,
    grey,
    indigo,
    lightBlue,
    pink,
    purple,
    red,
    teal,
    yellow,
} from '@mui/material/colors';
import { ScheduleCourse } from '@packages/antalmanac-types';

import { SectionColorSetting, useSectionColorStore } from './SettingsStore';

export const colorVariants: Record<SectionColorSetting, Record<string, string[]>> = {
    default: {
        blue: [blue[300], blue[200], blue[100], blue[400], blue[500]],
        pink: [pink[300], pink[200], pink[100], pink[400], pink[500]],
        purple: [purple[300], purple[200], purple[100], purple[400], purple[500]],
        green: [green[300], green[200], green[100], green[400], green[500]],
        amber: [amber[300], amber[200], amber[100], amber[400], amber[500]],
        deepPurple: [deepPurple[300], deepPurple[200], deepPurple[100], deepPurple[400], deepPurple[500]],
        deepOrange: [deepOrange[300], deepOrange[200], deepOrange[100], deepOrange[400], deepOrange[500]],
    },
    legacy: {
        blue: [blue[500], '#51b0f6', '#b1dcfb', '#042944', '#042944'],
        pink: [pink[500], '#ee4f88', '#f7abc7', '#f7abc7', '#f7abc7'],
        purple: [purple[500], '#bd36d3', '#d98ae5', '#070208', '#070208'],
        green: [green[500], '#6ebf71', '#b5deb6', '#b5deb6', '#b5deb6'],
        amber: [amber[500], '#ffd338', '#ffea9e', '#382c00', '#050400'],
        deepPurple: [deepPurple[500], '#8458ca', '#bda6e3', '#10091b', '#10091b'],
        deepOrange: [deepOrange[500], '#ff7f57', '#ffcdbd', '#571500', '#240900'],
    },
    catppuccin: {
        rosewater: ['#f5e0dc', '#f2cdcd', '#f5c2e7', '#cba6f7', '#94e2d5'],
        flamingo: ['#f2cdcd', '#f5c2e7', '#cba6f7', '#89b4fa', '#74c7ec'],
        mauve: ['#cba6f7', '#89b4fa', '#74c7ec', '#94e2d5', '#a6e3a1'],
        sapphire: ['#74c7ec', '#89dceb', '#94e2d5', '#a6e3a1', '#f9e2af'],
        lavender: ['#b4befe', '#c6d0f5', '#d0d8f5', '#e1e8f5', '#f5e0dc'],
        maroon: ['#eba0ac', '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1'],
        teal: ['#94e2d5', '#89dceb', '#74c7ec', '#89b4fa', '#cba6f7'],
    },
};

export const colorPickerPresetColors = [
    brown[200],
    red[200],
    deepOrange[200],
    amber[200],
    yellow[200],
    green[200],
    teal[200],
    cyan[100],
    lightBlue[200],
    indigo[200],
    deepPurple[200],
    pink[200],
    green[300],
    grey[600],
    grey[300],
    grey[50],
];

/**
 * Takes in a hex color and returns a color variant hex color that is not already used.
 * Uses predefined shade variants from the same color family.
 *
 * @param originalColor string: Hex color ("#RRGGBB") as a basis.
 * @param usedColors Set<string>: A set of hex colors that are already used.
 *
 * @return Unused hex color that is close to the original color ("#RRGGBB").
 */
function generateColorVariant(
    originalColor: string,
    usedColors: Set<string>,
    sectionColor: SectionColorSetting
): string {
    let family: string | null = null;
    for (const f in colorVariants[sectionColor]) {
        if (colorVariants[sectionColor][f].includes(originalColor)) {
            family = f;
            break;
        }
    }

    // Fallback to original color if no family found
    if (!family) return originalColor;

    for (const variant of colorVariants[sectionColor][family]) {
        if (!usedColors.has(variant)) {
            return variant;
        }
    }

    // If all variants are used, fallback to original
    return originalColor;
}

export function getColorForNewSection(newSection: ScheduleCourse, sectionsInSchedule: ScheduleCourse[]): string {
    // Use the color of the closest section with the same title

    // Array of sections that have the same course title (i.e., they're under the same course),
    // sorted by their distance from the new section's section code
    const existingSections: Array<ScheduleCourse> = sectionsInSchedule
        .filter((course) => course.courseTitle === newSection.courseTitle)
        .sort(
            // Sort by distance from new section's section code
            (a, b) =>
                Math.abs(parseInt(a.section.sectionCode) - parseInt(newSection.section.sectionCode)) -
                Math.abs(parseInt(b.section.sectionCode) - parseInt(newSection.section.sectionCode))
        );

    // New array of courses that share the same sectionType & courseTitle
    const existingSectionsType = existingSections.filter(
        (course) => course.section.sectionType === newSection.section.sectionType
    );
    const sectionColor = useSectionColorStore.getState().sectionColor;
    const defaultColors = Object.values(colorVariants[sectionColor]).map((variants) => variants[0]);
    const usedColors = sectionsInSchedule.map((course) => course.section.color);
    const lastDefaultColor = usedColors.findLast((materialColor) =>
        (defaultColors as string[]).includes(materialColor)
    ) as unknown as (typeof defaultColors)[number];

    // If the same sectionType exists, return that color
    if (existingSectionsType.length > 0) return existingSectionsType[0].section.color;

    // If the same courseTitle exists, but not the same sectionType, return a close color
    if (existingSections.length > 0) {
        return generateColorVariant(existingSections[0].section.color, new Set(usedColors), sectionColor);
    }

    // If there are no existing sections with the same course title, generate a new color. If we run out of unique colors, return the next color up after the last default color in use, looping after reaching the end.
    return (
        defaultColors.find((materialColor) => !usedColors.includes(materialColor)) ||
        defaultColors[(defaultColors.indexOf(lastDefaultColor) + 1) % defaultColors.length]
    );
}
