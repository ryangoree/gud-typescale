// Color
export {
  type ColorPaletteCSSOptions,
  type ColorScaleOptions,
  generateColorPaletteCss,
  generateColorPalettes,
  generateColorScale,
  interpolateOklch,
} from '#src/lib/colors/colorPaletteGenerator';
export { toCmyk, toHex, toHsl, toOklab, toOklch, toRgb } from '#src/lib/colors/convert';
export { formatColor } from '#src/lib/colors/format';
export { type ParsedColor, parseColor } from '#src/lib/colors/parse';
export type { CMYK, Color, HSL, OKLAB, OKLCH, RGB } from '#src/lib/colors/types';

// Typography
export { gudLineHeight, type LineHeightOptions } from '#src/lib/typography/lineHeight';
export {
  type BaseTypeScaleOptions,
  DEFAULT_TYPE_SCALE_HIERARCHY,
  type DefaultTypeScaleStyle,
  gudFontSize,
  gudTypeScale,
  gudTypeScaleCss,
  gudTypeScaleIndex,
  type TypeScale,
  type TypeScaleCSSOptions,
  type TypeScaleOptions,
  type TypeScaleUnit,
  type TypeScaleValue,
} from '#src/lib/typography/typeScale';

// utils
export { pxToRem } from '#src/lib/utils/pxToRem';
export { rounder } from '#src/lib/utils/rounder';
