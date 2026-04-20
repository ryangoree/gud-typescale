import type { CMYK, Color, HSL, OKLAB, OKLCH, RGB } from '#src/lib/colors/types';
import { safeStringifyObject } from '#src/lib/utils/safeStringifyObject';

/**
 * Represents a parsed color with its format and normalized color values.
 */
export type ParsedColor =
  | {
      format: 'rgb';
      color: RGB;
    }
  | {
      format: 'oklab';
      color: OKLAB;
    }
  | {
      format: 'oklch';
      color: OKLCH;
    }
  | {
      format: 'hsl';
      color: HSL;
    }
  | {
      format: 'cmyk';
      color: CMYK;
    };

/**
 * Parses a color string or object into a structured format with normalized values.
 * @param color - The color to parse, either as a string (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5
 * 0.1 0.1)") or as a Color object.
 * @returns The parsed color in a structured format.
 */
export function parseColor(color: Color | string): ParsedColor {
  if (typeof color === 'object') {
    return parseColorObject(color);
  }
  return parseColorString(color);
}

/**
 * A regex-based parser for color strings. Supports various formats including hex, rgb/rgba, oklab,
 * oklch, and hsl/hsla. The regex captures the color format, the three main color components, and an
 * optional alpha component. It is designed to be flexible with whitespace and separators (commas or
 * spaces).
 */
// https://regex101.com/r/SrJq3n/2
const COLOR_REGEX =
  /^\s*(rgba?|oklab|oklch|hsla?)\(\s*(none|[\d.%]+(?:deg)?)\s*[,\s]\s*(none|[\d.%]+(?:deg)?)\s*[,\s]\s*(none|[\d.%]+(?:deg)?)\s*(?:[/,]\s*(none|[\d.%]+(?:deg)?)\s*)?\)\s*$/i;

/**
 * A regex-based parser for device-cmyk() color strings. Captures the four CMYK components and an
 * optional alpha value, all as space-separated values.
 */
// https://regex101.com/r/SJbzdj/1
const DEVICE_CMYK_REGEX =
  /^\s*device-cmyk\(\s*(none|[\d.%]+)\s+(none|[\d.%]+)\s+(none|[\d.%]+)\s+(none|[\d.%]+)(?:\s*\/\s*(none|[\d.%]+))?\s*\)\s*$/i;

/**
 * Parses a color object into a structured format.
 * @param color - The Color object to parse.
 * @returns The parsed color in a structured format.
 * @throws If the color object format is unsupported.
 */
function parseColorObject(color: Color): ParsedColor {
  if ('r' in color) {
    return { format: 'rgb', color };
  }
  if ('a' in color) {
    return { format: 'oklab', color };
  }
  if ('k' in color) {
    return { format: 'cmyk', color };
  }
  if ('s' in color) {
    return { format: 'hsl', color };
  }
  if ('c' in color) {
    return { format: 'oklch', color };
  }
  const stringifiedColor = safeStringifyObject(color);
  throw new Error(`Unsupported color object: ${stringifiedColor}`);
}

/**
 * Parses a color string into a structured format.
 * @param color - The color string to parse (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)").
 * @returns The parsed color in a structured format.
 * @throws If the color string format is unsupported or invalid.
 */
function parseColorString(color: string): ParsedColor {
  if (color.startsWith('#')) {
    return {
      format: 'rgb',
      color: hexToRgb(color),
    };
  }

  const cmykMatch = color.match(DEVICE_CMYK_REGEX);
  if (cmykMatch) {
    const [, c, m, y, k, alpha] = cmykMatch as [
      string,
      string,
      string,
      string,
      string,
      string | undefined,
    ];
    return {
      format: 'cmyk',
      color: {
        c: normalizeColorValue(c),
        m: normalizeColorValue(m),
        y: normalizeColorValue(y),
        k: normalizeColorValue(k),
        alpha: alpha ? normalizeColorValue(alpha) : 1,
      },
    };
  }

  const [_, format, v1, v2, v3, alpha] = color.toLowerCase().match(COLOR_REGEX) || [];

  if (!format || !v1 || !v2 || !v3) {
    throw new Error(`Unsupported color format: ${color}`);
  }

  switch (format) {
    case 'rgb':
    case 'rgba':
      return {
        format: 'rgb',
        color: {
          r: normalizeRgbValue(v1),
          g: normalizeRgbValue(v2),
          b: normalizeRgbValue(v3),
          alpha: alpha ? normalizeColorValue(alpha) : 1,
        },
      };

    case 'oklab':
      return {
        format: 'oklab',
        color: {
          l: normalizeColorValue(v1),
          a: normalizeColorValue(v2, 0.4),
          b: normalizeColorValue(v3, 0.4),
          alpha: alpha ? normalizeColorValue(alpha) : 1,
        },
      };

    case 'oklch':
      return {
        format: 'oklch',
        color: {
          l: normalizeColorValue(v1),
          c: normalizeColorValue(v2, 0.4),
          h: parseFloat(v3),
          alpha: alpha ? normalizeColorValue(alpha) : 1,
        },
      };

    case 'hsl':
    case 'hsla':
      return {
        format: 'hsl',
        color: {
          h: v1 === 'none' ? 0 : parseFloat(v1),
          s: normalizeColorValue(v2),
          l: normalizeColorValue(v3),
          alpha: alpha ? normalizeColorValue(alpha) : 1,
        },
      };

    default:
      throw new Error(`Unsupported color string: ${color}`);
  }
}

/**
 * Normalizes an RGB color value that may be a plain number or a percentage.
 * @param value - The RGB color value as a string.
 * @returns The normalized RGB value (0-1).
 */
function normalizeRgbValue(value: string): number {
  const number = parseFloat(value);
  if (value.endsWith('%')) {
    return number / 100;
  }
  return number / 255;
}

/**
 * Normalizes a CSS color value that may be a plain number or a percentage.
 * @param percentMax - The value that 100% maps to (e.g. 1 for L/alpha, 0.4 for a/b/C). Default is
 * 1.
 * @returns The normalized color value (0 to percentMax).
 */
function normalizeColorValue(value: string, percentMax = 1): number {
  if (value === 'none') return 0;
  const number = parseFloat(value);
  if (value.endsWith('%')) {
    return (number / 100) * percentMax;
  }
  return number;
}

/**
 * Converts a hex color string to an RGB object with normalized values. Supports both 3-digit and
 * 6-digit hex formats, as well as an optional alpha channel (8-digit hex).
 * @param hex - The hex color string to convert (e.g. "#ff0000", "#f00", "#ff000080").
 * @returns The RGB representation of the hex color with normalized values.
 * @throws If the hex color format is invalid.
 */
function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace(/^#/, '');
  let r: string | undefined;
  let g: string | undefined;
  let b: string | undefined;
  let a: string | undefined;

  // shorthand
  if (cleanHex.length === 3) {
    r = `${cleanHex[0]}${cleanHex[0]}`;
    g = `${cleanHex[1]}${cleanHex[1]}`;
    b = `${cleanHex[2]}${cleanHex[2]}`;
  }

  // full
  if (cleanHex.length === 6 || cleanHex.length === 8) {
    r = cleanHex.slice(0, 2);
    g = cleanHex.slice(2, 4);
    b = cleanHex.slice(4, 6);
    if (cleanHex.length === 8) {
      a = cleanHex.slice(6, 8);
    }
  }

  if (!r || !g || !b) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(r, 16) / 255,
    g: parseInt(g, 16) / 255,
    b: parseInt(b, 16) / 255,
    alpha: a ? parseInt(a, 16) / 255 : 1,
  };
}
