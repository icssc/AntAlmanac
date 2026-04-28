/**
 * W3C-related brightness check (vs white) for choosing readable text on a solid background.
 * Same logic as the schedule calendar (`CalendarRoot` `eventStyleGetter`), not MUI getContrastText.
 */
export function colorContrastSufficient(bg: string): boolean {
    const minBrightnessDiff = 125;

    const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg.slice(0, 7)) as RegExpExecArray;
    const backgroundRGB = {
        r: parseInt(backgroundRegexResult[1], 16),
        g: parseInt(backgroundRegexResult[2], 16),
        b: parseInt(backgroundRegexResult[3], 16),
    } as const;
    const textRgb = { r: 255, g: 255, b: 255 };

    const getBrightness = (color: typeof backgroundRGB) => (color.r * 299 + color.g * 587 + color.b * 114) / 1000;

    const bgBrightness = getBrightness(backgroundRGB);
    const textBrightness = getBrightness(textRgb);
    return Math.abs(bgBrightness - textBrightness) > minBrightnessDiff;
}
