import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@material-ui/core/colors';
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
 * Checks if an HSL color is contained in an array of colors, within a delta
 */
function colorIsContained(color: HSLColor, usedColors: Iterable<HSLColor>, delta: number): boolean {
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
 * Takes in a hex color and returns a hex color that is close to the original but not already used.
 * Takes changes the lightness of the color by a small amount until a color that is not already used is found.
 *
 * @param originalColor string: Hex color ("#RRGGBB") as a basis.
 * @param usedColors Set<string>: A set of hex colors that are already used.
 * @param variation number [0-1]: The step size to use when generating a new color.
 *      The bigger the number, the more different the new color will be.
 *
 * @return Unused hex color that is close to the original color ("#RRGGBB").
 */
function generateCloseColor(originalColor: string, usedColors: Set<string>, variation = 0.1): string {
    const usedColorsHSL = [...usedColors].map(HexToHSL);

    // Generate a color that is slightly different from the original color and that is not already used
    // Keep generating until color doesn't match any of the used colors
    let color: HSLColor = HexToHSL(originalColor);

    for (
        let delta = variation;
        colorIsContained(color, usedColorsHSL, 0.01); // Checks if color is contained in usedColorsHSL
        delta += variation
    ) {
        color = {
            ...color,
            l: Math.round(((color.l + delta) * 100) % 100) / 100,
        };
    }

    return HSLToHex(color);
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

    const usedColors = new Set(sectionsInSchedule.map((course) => course.section.color));

    // If the same sectionType exists, return that color
    if (existingSectionsType.length > 0) return existingSectionsType[0].section.color;

    // If the same courseTitle exists, but not the same sectionType, return a close color
    if (existingSections.length > 0) return generateCloseColor(existingSections[0].section.color, usedColors);

    // If there are no existing sections with the same course title, generate a new color. If we run out of unique colors, return a random one that's been used already.
    return (
        defaultColors.find((materialColor) => !usedColors.has(materialColor)) ||
        defaultColors[Math.floor(Math.random() * defaultColors.length)]
    );
}
