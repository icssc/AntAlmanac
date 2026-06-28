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
import type { AACourseWithTerm, AASection, AATerm } from '@packages/antalmanac-types';

export function scheduleOfferingKey(course: Pick<AACourseWithTerm, 'term' | 'courseId' | 'courseTitle'>): string {
    return `${course.term.shortName}::${course.courseId}::${course.courseTitle}`;
}

export function scheduleSectionKey(term: AATerm | string, sectionCode: string): string {
    const termId = typeof term === 'string' ? term : term.shortName;
    return `${termId}::${sectionCode}`;
}

const colorVariants: Record<string, string[]> = {
    blue: [blue[300], blue[200], blue[100], blue[400], blue[500]],
    pink: [pink[300], pink[200], pink[100], pink[400], pink[500]],
    purple: [purple[300], purple[200], purple[100], purple[400], purple[500]],
    green: [green[300], green[200], green[100], green[400], green[500]],
    amber: [amber[300], amber[200], amber[100], amber[400], amber[500]],
    deepPurple: [deepPurple[300], deepPurple[200], deepPurple[100], deepPurple[400], deepPurple[500]],
    deepOrange: [deepOrange[300], deepOrange[200], deepOrange[100], deepOrange[400], deepOrange[500]],
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
function generateColorVariant(originalColor: string, usedColors: Set<string>): string {
    let family: string | null = null;
    for (const f in colorVariants) {
        if (colorVariants[f].includes(originalColor)) {
            family = f;
            break;
        }
    }

    // Fallback to original color if no family found
    if (!family) return originalColor;

    for (const variant of colorVariants[family]) {
        if (!usedColors.has(variant)) {
            return variant;
        }
    }

    // If all variants are used, fallback to original
    return originalColor;
}

export function getColorForNewSection(
    newSection: AASection,
    course: AACourseWithTerm,
    coursesInSchedule: AACourseWithTerm[]
): string {
    const defaultColors: string[] = Object.values(colorVariants).map((variants) => variants[0]);
    const usedColors = coursesInSchedule.flatMap((c) => c.sections.map((s) => s.color));
    const lastDefaultIndex = usedColors.findLastIndex((color) => defaultColors.includes(color));

    const offeringKey = scheduleOfferingKey(course);
    const sameOfferingSections = coursesInSchedule
        .filter((c) => scheduleOfferingKey(c) === offeringKey)
        .flatMap((c) => c.sections)
        .sort(
            (a, b) =>
                Math.abs(parseInt(a.sectionCode) - parseInt(newSection.sectionCode)) -
                Math.abs(parseInt(b.sectionCode) - parseInt(newSection.sectionCode))
        );

    const sameSectionType = sameOfferingSections.filter((s) => s.sectionType === newSection.sectionType);
    if (sameSectionType.length > 0) return sameSectionType[0].color;

    if (sameOfferingSections.length > 0) {
        return generateColorVariant(sameOfferingSections[0].color, new Set(usedColors));
    }

    const nextDefaultIndex = (lastDefaultIndex + 1) % defaultColors.length;
    return defaultColors.find((color) => !usedColors.includes(color)) ?? defaultColors[nextDefaultIndex];
}
