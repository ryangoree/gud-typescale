import { parseColor } from '#src/lib/colors/parse';
import type { CMYK, Color, HSL, OKLAB, OKLCH, RGB } from '#src/lib/colors/types';

/**
 * Formats a Color object into a CSS string representation based on its format.
 * @param color - The Color object to format.
 * @returns The CSS string representation of the color in its original format.
 */
export function formatColor(color: Color): string {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return formatRgb(parsed.color);
    case 'oklab':
      return formatOklab(parsed.color);
    case 'oklch':
      return formatOklch(parsed.color);
    case 'hsl':
      return formatHsl(parsed.color);
    case 'cmyk':
      return formatCmyk(parsed.color);
  }
}

/**
 * Formats the alpha component of a color if it is less than 1, otherwise returns an empty string.
 */
function formatAlpha(alpha: number): string {
  return alpha < 1 ? ` / ${alpha}` : '';
}

/**
 * Formats an RGB color object into a string representation (e.g. "rgb(255 0 0 / 0.5)").
 */
function formatRgb({ r, g, b, alpha }: RGB): string {
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(
    b * 255,
  )}${formatAlpha(alpha)})`;
}

/**
 * Formats an OKLAB color object into a string representation (e.g. "oklab(0.5 0.1 0.1 / 0.5)").
 */
function formatOklab({ l, a, b, alpha }: OKLAB): string {
  return `oklab(${l} ${a} ${b}${formatAlpha(alpha)})`;
}

/**
 * Formats an OKLCH color object into a string representation (e.g. "oklch(0.5 0.1 30 / 0.5)").
 */
function formatOklch({ l, c, h, alpha }: OKLCH): string {
  return `oklch(${l} ${c} ${h}${formatAlpha(alpha)})`;
}

/**
 * Formats an HSL color object into a CSS hsl() string (e.g. "hsl(120 75% 50% / 0.5)").
 */
function formatHsl({ h, s, l, alpha }: HSL): string {
  return `hsl(${h} ${s * 100}% ${l * 100}%${formatAlpha(alpha)})`;
}

/**
 * Formats a CMYK color object into a CSS device-cmyk() string (e.g. "device-cmyk(0% 100% 100% 0% /
 * 0.5)").
 */
function formatCmyk({ c, m, y, k, alpha }: CMYK): string {
  return `device-cmyk(${c * 100}% ${m * 100}% ${y * 100}% ${k * 100}%${formatAlpha(alpha)})`;
}
