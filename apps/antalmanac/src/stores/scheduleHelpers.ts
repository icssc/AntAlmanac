import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@mui/material/colors';
import { ScheduleCourse } from '@packages/antalmanac-types';

export interface HSLColor {
    h: number;
    s: number;
    l: number;
}

const defaultColors = [blue[500], pink[500], purple[500], green[500], amber[500], deepPurple[500], deepOrange[500]];

/**
 * Converts a hex color to HSL
 * Assumes the hex color is in the format #RRGGBB
 * Adapted from https://stackoverflow.com/a/9493060
 *
 * @param hex str: hex string representation of a color
 *
 * @return An HSLColor object where h, s, and l are in the range [0, 1]
 */
function HexToHSL(hex: string): HSLColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        throw new Error('Could not parse Hex Color');
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                throw new Error('Error converting hex to hsl');
        }
        h /= 6;
    }

    [h, s, l] = [h, s, l].map((val: number) => Math.round(val * 100) / 100);

    return { h, s, l };
}

/**
 * Converts HSL color in the range [0, 1] to a hex string ("#RRGGBB")
 * Adapted from https://stackoverflow.com/a/9493060
 */
function HSLToHex({ h, s, l }: HSLColor): string {
    // Check that h, s, and l are in the range [0, 1]
    if (h < 0 || h > 1 || s < 0 || s > 1 || l < 0 || l > 1) {
        throw new Error('Invalid HSLColor');
    }

    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    [r, g, b] = [r, g, b].map((x) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, '0')
    );

    return `#${r}${g}${b}`;
}

/**
 * Checks if an HSL color has already been used, given an array of used colors and a delta.
 */
function isColorUsed(color: HSLColor, usedColors: Iterable<HSLColor>, delta: number): boolean {
    for (const usedColor of usedColors) {
        if (
            Math.abs(usedColor.h - color.h) < delta &&
            Math.abs(usedColor.s - color.s) < delta &&
            Math.abs(usedColor.l - color.l) < delta
        )
            return true;
    }
    return false;
}

/**
 * Checks if an HSL color is visible and provides enough contrast against the background.
 *
 * @param color HSLColor: The color to check.
 * @param minimum_luminance number: The minimum luminance value to consider the color visible, defaults to 0.2.
 * @param maximum_luminance number: The maximum luminance value to consider the color visible, defaults to 0.8.
 * @returns boolean: True if the color is visible enough, false otherwise.
 */
function isColorVisible(color: HSLColor, minimum_luminance = 0.2, maximum_luminance = 0.8): boolean {
    return color.l >= minimum_luminance && color.l <= maximum_luminance;
}

/**
 * Takes in a hex color and returns a hex color that is close to the original but not already used.
 * Change the luminance of the color by a small amount until a color that is not already used is found.
 * Prefers lighter colors over darker.
 *
 * @param originalColor string: Hex color ("#RRGGBB") as a basis.
 * @param usedColors Set<string>: A set of hex colors that are already used.
 * @param variation number [0-1]: The step size to use when generating a new color.
 *      The bigger the number, the more different the new color will be.
 *
 * @return Unused hex color that is close to the original color ("#RRGGBB").
 */
function generateCloseColor(originalColor: string, usedColors: Set<string>, variation = 0.1): string {
    const usedHSLColors = [...usedColors].map(HexToHSL);
    const originalHSLColor: HSLColor = HexToHSL(originalColor);

    const MAX_ITERATIONS = 20; // prevent infinite loop when variation <= 0

    let delta = variation;
    let iterations = 0;
    while (Math.abs(delta) <= 1 && iterations < MAX_ITERATIONS) {
        const lighterHSLColor = { ...originalHSLColor, l: originalHSLColor.l + delta };
        const darkerColorHSL = { ...originalHSLColor, l: originalHSLColor.l - delta };

        if (!isColorUsed(lighterHSLColor, usedHSLColors, variation) && isColorVisible(lighterHSLColor)) {
            return HSLToHex(lighterHSLColor);
        }

        if (!isColorUsed(darkerColorHSL, usedHSLColors, variation) && isColorVisible(darkerColorHSL)) {
            return HSLToHex(darkerColorHSL);
        }

        delta += variation;
        iterations++;
    }

    // If no suitable color is found, fallback to original color
    return HSLToHex(originalHSLColor);
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

    const usedColors = sectionsInSchedule.map((course) => course.section.color);
    const lastDefaultColor = usedColors.findLast((materialColor) =>
        (defaultColors as string[]).includes(materialColor)
    ) as unknown as (typeof defaultColors)[number];

    // If the same sectionType exists, return that color
    if (existingSectionsType.length > 0) return existingSectionsType[0].section.color;

    // If the same courseTitle exists, but not the same sectionType, return a close color
    if (existingSections.length > 0) return generateCloseColor(existingSections[0].section.color, new Set(usedColors));

    // If there are no existing sections with the same course title, generate a new color. If we run out of unique colors, return the next color up after the last default color in use, looping after reaching the end.
    return (
        defaultColors.find((materialColor) => !usedColors.includes(materialColor)) ||
        defaultColors[(defaultColors.indexOf(lastDefaultColor) + 1) % defaultColors.length]
    );
}
