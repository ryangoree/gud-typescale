import { parseColor } from '#src/lib/colors/parse';
import type { CMYK, Color, HSL, OKLAB, OKLCH, RGB } from '#src/lib/colors/types';
import { clamp } from '#src/lib/utils/clamp';

/**
 * Converts a color in any supported format to an RGB object with normalized values (0-1).
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @returns The RGB representation of the input color with normalized values (0-1).
 * @throws If the input color format is invalid or unsupported.
 */
export function toRgb(color: Color | string): RGB {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return parsed.color;
    case 'oklab':
      return oklabToRgb(parsed.color);
    case 'oklch':
      return oklabToRgb(oklchToOklab(parsed.color));
    case 'hsl':
      return hslToRgb(parsed.color);
    case 'cmyk':
      return cmykToRgb(parsed.color);
  }
}

/**
 * Converts a color in any supported format to an OKLAB object.
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @returns The OKLAB representation of the input color.
 * @throws If the input color format is invalid or unsupported.
 */
export function toOklab(color: Color | string): OKLAB {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return rgbToOklab(parsed.color);
    case 'oklab':
      return parsed.color;
    case 'oklch':
      return oklchToOklab(parsed.color);
    case 'hsl':
      return rgbToOklab(hslToRgb(parsed.color));
    case 'cmyk':
      return rgbToOklab(cmykToRgb(parsed.color));
  }
}

/**
 * Converts a color in any supported format to an OKLCH object.
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @returns The OKLCH representation of the input color.
 * @throws If the input color format is invalid or unsupported.
 */
export function toOklch(color: Color | string): OKLCH {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return oklabToOklch(rgbToOklab(parsed.color));
    case 'oklab':
      return oklabToOklch(parsed.color);
    case 'oklch':
      return parsed.color;
    case 'hsl':
      return oklabToOklch(rgbToOklab(hslToRgb(parsed.color)));
    case 'cmyk':
      return oklabToOklch(rgbToOklab(cmykToRgb(parsed.color)));
  }
}

/**
 * Converts a color in any supported format to a hex string.
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @return The hex color string representation of the input color (e.g. "#ff0000" or "#ff000080" if
 * alpha is present).
 * @throws If the input color format is invalid or unsupported.
 */
export function toHex(color: Color | string): `#${string}` {
  return rgbToHex(toRgb(color));
}

/**
 * Converts a color in any supported format to an HSL object.
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @returns The HSL representation of the input color with h in degrees (0-360) and s/l in (0-1).
 * @throws If the input color format is invalid or unsupported.
 */
export function toHsl(color: Color | string): HSL {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return rgbToHsl(parsed.color);
    case 'oklab':
      return rgbToHsl(oklabToRgb(parsed.color));
    case 'oklch':
      return rgbToHsl(oklabToRgb(oklchToOklab(parsed.color)));
    case 'hsl':
      return parsed.color;
    case 'cmyk':
      return rgbToHsl(cmykToRgb(parsed.color));
  }
}

/**
 * Converts a color in any supported format to a CMYK object.
 * @param color - The color to convert, which can be a Color object or a string in various formats
 * (e.g. "#ff0000", "rgb(255 0 0)", "oklab(0.5 0.1 0.1)", "hsl(120 50% 50%)", "device-cmyk(0 1 1
 * 0)").
 * @returns The CMYK representation of the input color with normalized values (0-1).
 * @throws If the input color format is invalid or unsupported.
 */
export function toCmyk(color: Color | string): CMYK {
  const parsed = parseColor(color);
  switch (parsed.format) {
    case 'rgb':
      return rgbToCmyk(parsed.color);
    case 'oklab':
      return rgbToCmyk(oklabToRgb(parsed.color));
    case 'oklch':
      return rgbToCmyk(oklabToRgb(oklchToOklab(parsed.color)));
    case 'hsl':
      return rgbToCmyk(hslToRgb(parsed.color));
    case 'cmyk':
      return parsed.color;
  }
}

/**
 * Converts an sRGB color value to a linear color value.
 * @param c - The sRGB color value (0-1).
 * @returns The linear color value (0-1).
 */
function srgbToLinear(c: number): number {
  return c >= 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
}

/**
 * Converts a linear color value to an sRGB color value.
 * @param c - The linear color value (0-1).
 * @returns The sRGB color value (0-1).
 */
function linearToSrgb(c: number): number {
  return c >= 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c;
}

/**
 * Converts an RGB color object to a hex color string.
 * @param rgb - The RGB color object.
 * @returns The hex color string representation of the input color.
 */
function rgbToHex({ r, g, b, alpha }: RGB): `#${string}` {
  const r_ = toHexChannel(r);
  const g_ = toHexChannel(g);
  const b_ = toHexChannel(b);
  const a = alpha < 1 ? toHexChannel(alpha) : undefined;

  return `#${r_}${g_}${b_}${a ?? ''}` as `#${string}`;
}

/**
 * Converts a color channel value (0-1) to a two-digit hexadecimal string.
 * @param channel - The color channel value (0-1).
 * @returns The two-digit hexadecimal string representation of the input value.
 */
function toHexChannel(channel: number): string {
  return Math.round(channel * 255)
    .toString(16)
    .padStart(2, '0');
}

/**
 * Converts an RGB color object to an OKLAB color object.
 * @param rgb - The RGB color object.
 * @returns The OKLAB color object.
 */
function rgbToOklab({ r, g, b, alpha }: RGB): OKLAB {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha,
  };
}

/**
 * Converts an OKLAB color object to an RGB color object.
 * @param param0 - The OKLAB color object.
 * @returns The RGB color object.
 */
function oklabToRgb({ l, a, b, alpha }: OKLAB): RGB {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return {
    r: clamp(linearToSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3)),
    g: clamp(linearToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3)),
    b: clamp(linearToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3)),
    alpha,
  };
}

/**
 * Converts an OKLAB color object to an OKLCH color object.
 * @param param0 - The OKLAB color object.
 * @returns The OKLCH color object.
 */
function oklabToOklch({ l, a, b, alpha }: OKLAB): OKLCH {
  return {
    l,
    c: Math.sqrt(a * a + b * b),
    h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
    alpha,
  };
}

/**
 * Converts an OKLCH color object to an OKLAB color object.
 * @param param0 - The OKLCH color object.
 * @returns The OKLAB color object.
 */
function oklchToOklab({ l, c, h, alpha }: OKLCH): OKLAB {
  const hRad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(hRad), b: c * Math.sin(hRad), alpha };
}

function rgbToHsl({ r, g, b, alpha }: RGB): HSL {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l, alpha };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) {
    h = (((g - b) / delta) % 6) * 60;
  } else if (max === g) {
    h = ((b - r) / delta + 2) * 60;
  } else {
    h = ((r - g) / delta + 4) * 60;
  }
  if (h < 0) h += 360;

  return { h, s, l, alpha };
}

function hslToRgb({ h, s, l, alpha }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  const sector = Math.floor(h / 60) % 6;
  if (sector === 0) {
    r = c;
    g = x;
    b = 0;
  } else if (sector === 1) {
    r = x;
    g = c;
    b = 0;
  } else if (sector === 2) {
    r = 0;
    g = c;
    b = x;
  } else if (sector === 3) {
    r = 0;
    g = x;
    b = c;
  } else if (sector === 4) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return { r: r + m, g: g + m, b: b + m, alpha };
}

function rgbToCmyk({ r, g, b, alpha }: RGB): CMYK {
  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1, alpha };
  }
  return {
    c: (1 - r - k) / (1 - k),
    m: (1 - g - k) / (1 - k),
    y: (1 - b - k) / (1 - k),
    k,
    alpha,
  };
}

function cmykToRgb({ c, m, y, k, alpha }: CMYK): RGB {
  return {
    r: (1 - c) * (1 - k),
    g: (1 - m) * (1 - k),
    b: (1 - y) * (1 - k),
    alpha,
  };
}
