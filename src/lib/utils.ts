/**
 * utils is a terrible file name, which is good for putting in completely random functions
 */

/**
 * equation taken from w3c, omits the colour difference part
 * @see @link{https://www.w3.org/TR/WCAG20/#relativeluminancedef}
 */
export function isContrastSufficient(color: string) {
  const minBrightnessDiff = 125;

  const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);

  if (!backgroundRegexResult) {
    return true;
  }

  const backgroundRGB = {
    r: parseInt(backgroundRegexResult[1], 16),
    g: parseInt(backgroundRegexResult[2], 16),
    b: parseInt(backgroundRegexResult[3], 16),
  };

  const textRgb = { r: 255, g: 255, b: 255 }; // white text

  const getBrightness = (color: typeof backgroundRGB) => {
    return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
  };

  const bgBrightness = getBrightness(backgroundRGB);
  const textBrightness = getBrightness(textRgb);
  return Math.abs(bgBrightness - textBrightness) > minBrightnessDiff;
}
