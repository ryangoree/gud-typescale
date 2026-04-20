import { describe, expect, it } from 'vitest';
import { toCmyk, toHex, toHsl, toOklab, toOklch, toRgb } from '#src/lib/colors/convert';

// sRGB red (#ff0000) in each color space (reference values from the Oklab specification)
const RED_RGB = { r: 1, g: 0, b: 0, alpha: 1 };
const RED_OKLAB = { l: 0.627955, a: 0.224863, b: 0.125846, alpha: 1 };
const RED_OKLCH = { l: 0.627955, c: 0.257683, h: 29.234, alpha: 1 };
const RED_HSL = { h: 0, s: 1, l: 0.5, alpha: 1 };
const RED_CMYK = { c: 0, m: 1, y: 1, k: 0, alpha: 1 };

describe('toRgb', () => {
  it('returns an RGB color unchanged', () => {
    expect(toRgb(RED_RGB)).toEqual(RED_RGB);
  });

  it('converts OKLAB to RGB', () => {
    const { r, g, b, alpha } = toRgb(RED_OKLAB);
    expect(r).toBeCloseTo(RED_RGB.r, 3);
    expect(g).toBeCloseTo(RED_RGB.g, 3);
    expect(b).toBeCloseTo(RED_RGB.b, 3);
    expect(alpha).toBe(1);
  });

  it('converts OKLCH to RGB', () => {
    const { r, g, b, alpha } = toRgb(RED_OKLCH);
    expect(r).toBeCloseTo(RED_RGB.r, 3);
    expect(g).toBeCloseTo(RED_RGB.g, 3);
    expect(b).toBeCloseTo(RED_RGB.b, 3);
    expect(alpha).toBe(1);
  });

  it('converts HSL to RGB', () => {
    expect(toRgb(RED_HSL)).toEqual(RED_RGB);
  });

  it('converts CMYK to RGB', () => {
    expect(toRgb(RED_CMYK)).toEqual(RED_RGB);
  });

  it('round-trips an RGB color through OKLAB and back', () => {
    const color = { r: 0.2, g: 0.6, b: 0.8, alpha: 1 };
    const result = toRgb(toOklab(color));
    expect(result.r).toBeCloseTo(color.r, 5);
    expect(result.g).toBeCloseTo(color.g, 5);
    expect(result.b).toBeCloseTo(color.b, 5);
    expect(result.alpha).toBe(1);
  });

  it('accepts a color string', () => {
    const { r, g, b, alpha } = toRgb('#ff0000');
    expect(r).toBeCloseTo(RED_RGB.r, 3);
    expect(g).toBeCloseTo(RED_RGB.g, 3);
    expect(b).toBeCloseTo(RED_RGB.b, 3);
    expect(alpha).toBe(1);
  });
});

describe('toOklab', () => {
  it('returns an OKLAB color unchanged', () => {
    expect(toOklab(RED_OKLAB)).toEqual(RED_OKLAB);
  });

  it('converts RGB to OKLAB', () => {
    const { l, a, b, alpha } = toOklab(RED_RGB);
    expect(l).toBeCloseTo(RED_OKLAB.l, 3);
    expect(a).toBeCloseTo(RED_OKLAB.a, 3);
    expect(b).toBeCloseTo(RED_OKLAB.b, 3);
    expect(alpha).toBe(1);
  });

  it('converts OKLCH to OKLAB', () => {
    const { l, a, b, alpha } = toOklab(RED_OKLCH);
    expect(l).toBeCloseTo(RED_OKLAB.l, 3);
    expect(a).toBeCloseTo(RED_OKLAB.a, 3);
    expect(b).toBeCloseTo(RED_OKLAB.b, 3);
    expect(alpha).toBe(1);
  });

  it('converts HSL to OKLAB', () => {
    const { l, a, b, alpha } = toOklab(RED_HSL);
    expect(l).toBeCloseTo(RED_OKLAB.l, 3);
    expect(a).toBeCloseTo(RED_OKLAB.a, 3);
    expect(b).toBeCloseTo(RED_OKLAB.b, 3);
    expect(alpha).toBe(1);
  });

  it('converts CMYK to OKLAB', () => {
    const { l, a, b, alpha } = toOklab(RED_CMYK);
    expect(l).toBeCloseTo(RED_OKLAB.l, 3);
    expect(a).toBeCloseTo(RED_OKLAB.a, 3);
    expect(b).toBeCloseTo(RED_OKLAB.b, 3);
    expect(alpha).toBe(1);
  });

  it('round-trips an OKLAB color through RGB and back', () => {
    const color = { l: 0.5, a: 0.1, b: 0.05, alpha: 1 };
    const result = toOklab(toRgb(color));
    expect(result.l).toBeCloseTo(color.l, 5);
    expect(result.a).toBeCloseTo(color.a, 5);
    expect(result.b).toBeCloseTo(color.b, 5);
    expect(result.alpha).toBe(1);
  });

  it('accepts a color string', () => {
    const { l, a, b, alpha } = toOklab('rgb(255 0 0)');
    expect(l).toBeCloseTo(RED_OKLAB.l, 3);
    expect(a).toBeCloseTo(RED_OKLAB.a, 3);
    expect(b).toBeCloseTo(RED_OKLAB.b, 3);
    expect(alpha).toBe(1);
  });
});

describe('toOklch', () => {
  it('returns an OKLCH color unchanged', () => {
    expect(toOklch(RED_OKLCH)).toEqual(RED_OKLCH);
  });

  it('converts RGB to OKLCH', () => {
    const { l, c, h, alpha } = toOklch(RED_RGB);
    expect(l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(h).toBeCloseTo(RED_OKLCH.h, 1);
    expect(alpha).toBe(1);
  });

  it('converts OKLAB to OKLCH', () => {
    const { l, c, h, alpha } = toOklch(RED_OKLAB);
    expect(l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(h).toBeCloseTo(RED_OKLCH.h, 1);
    expect(alpha).toBe(1);
  });

  it('converts HSL to OKLCH', () => {
    const { l, c, h, alpha } = toOklch(RED_HSL);
    expect(l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(h).toBeCloseTo(RED_OKLCH.h, 1);
    expect(alpha).toBe(1);
  });

  it('converts CMYK to OKLCH', () => {
    const { l, c, h, alpha } = toOklch(RED_CMYK);
    expect(l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(h).toBeCloseTo(RED_OKLCH.h, 1);
    expect(alpha).toBe(1);
  });

  it('round-trips an in-gamut OKLCH color through RGB and back', () => {
    const color = { l: 0.7, c: 0.1, h: 120, alpha: 1 };
    const result = toOklch(toRgb(color));
    expect(result.l).toBeCloseTo(color.l, 5);
    expect(result.c).toBeCloseTo(color.c, 5);
    expect(result.h).toBeCloseTo(color.h, 4);
    expect(result.alpha).toBe(1);
  });

  it('accepts a color string', () => {
    const { l, c, h, alpha } = toOklch('rgb(255 0 0)');
    expect(l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(h).toBeCloseTo(RED_OKLCH.h, 1);
    expect(alpha).toBe(1);
  });
});

describe('toHex', () => {
  it('converts red to hex', () => {
    expect(toHex(RED_RGB)).toBe('#ff0000');
  });

  it('converts white to hex', () => {
    expect(toHex({ r: 1, g: 1, b: 1, alpha: 1 })).toBe('#ffffff');
  });

  it('appends alpha channel when alpha is less than 1', () => {
    expect(toHex({ r: 1, g: 1, b: 1, alpha: 0.5 })).toBe('#ffffff80');
  });

  it('omits alpha channel when alpha is 1', () => {
    expect(toHex(RED_RGB)).toHaveLength(7);
  });

  it('converts from OKLAB to hex', () => {
    expect(toHex(RED_OKLAB)).toBe('#ff0000');
  });

  it('converts from HSL to hex', () => {
    expect(toHex(RED_HSL)).toBe('#ff0000');
  });

  it('converts from CMYK to hex', () => {
    expect(toHex(RED_CMYK)).toBe('#ff0000');
  });

  it('accepts a color string', () => {
    expect(toHex('rgb(255 0 0)')).toBe('#ff0000');
  });
});

describe('toHsl', () => {
  it('returns an HSL color unchanged', () => {
    expect(toHsl(RED_HSL)).toEqual(RED_HSL);
  });

  it('converts RGB to HSL', () => {
    expect(toHsl(RED_RGB)).toEqual(RED_HSL);
  });

  it('converts CMYK to HSL', () => {
    expect(toHsl(RED_CMYK)).toEqual(RED_HSL);
  });

  it('converts OKLAB to HSL', () => {
    const { h, s, l, alpha } = toHsl(RED_OKLAB);
    // Hue is circular: 359.9998° and 0° represent the same angle
    expect(Math.min(Math.abs(h - RED_HSL.h), Math.abs(h - 360))).toBeLessThan(0.1);
    expect(s).toBeCloseTo(RED_HSL.s, 3);
    expect(l).toBeCloseTo(RED_HSL.l, 3);
    expect(alpha).toBe(1);
  });

  it('converts OKLCH to HSL', () => {
    const { h, s, l, alpha } = toHsl(RED_OKLCH);
    // Hue is circular: 359.9998° and 0° represent the same angle
    expect(Math.min(Math.abs(h - RED_HSL.h), Math.abs(h - 360))).toBeLessThan(0.1);
    expect(s).toBeCloseTo(RED_HSL.s, 3);
    expect(l).toBeCloseTo(RED_HSL.l, 3);
    expect(alpha).toBe(1);
  });

  it('round-trips an HSL color through RGB and back', () => {
    const color = { h: 200, s: 0.6, l: 0.4, alpha: 1 };
    const result = toHsl(toRgb(color));
    expect(result.h).toBeCloseTo(color.h, 4);
    expect(result.s).toBeCloseTo(color.s, 5);
    expect(result.l).toBeCloseTo(color.l, 5);
    expect(result.alpha).toBe(1);
  });

  it('accepts a hex string', () => {
    expect(toHsl('#ff0000')).toEqual(RED_HSL);
  });

  it('accepts an hsl() string', () => {
    expect(toHsl('hsl(0 100% 50%)')).toEqual(RED_HSL);
  });
});

describe('toCmyk', () => {
  it('returns a CMYK color unchanged', () => {
    expect(toCmyk(RED_CMYK)).toEqual(RED_CMYK);
  });

  it('converts RGB to CMYK', () => {
    expect(toCmyk(RED_RGB)).toEqual(RED_CMYK);
  });

  it('converts HSL to CMYK', () => {
    expect(toCmyk(RED_HSL)).toEqual(RED_CMYK);
  });

  it('converts OKLAB to CMYK', () => {
    const { c, m, y, k, alpha } = toCmyk(RED_OKLAB);
    expect(c).toBeCloseTo(RED_CMYK.c, 3);
    expect(m).toBeCloseTo(RED_CMYK.m, 3);
    expect(y).toBeCloseTo(RED_CMYK.y, 3);
    expect(k).toBeCloseTo(RED_CMYK.k, 3);
    expect(alpha).toBe(1);
  });

  it('converts OKLCH to CMYK', () => {
    const { c, m, y, k, alpha } = toCmyk(RED_OKLCH);
    expect(c).toBeCloseTo(RED_CMYK.c, 3);
    expect(m).toBeCloseTo(RED_CMYK.m, 3);
    expect(y).toBeCloseTo(RED_CMYK.y, 3);
    expect(k).toBeCloseTo(RED_CMYK.k, 3);
    expect(alpha).toBe(1);
  });

  it('round-trips a canonical CMYK color through RGB and back', () => {
    // k=0 keeps the round-trip lossless (canonical form: k = 1 - max(r,g,b))
    const color = { c: 0, m: 0.5, y: 1, k: 0, alpha: 1 };
    const result = toCmyk(toRgb(color));
    expect(result.c).toBeCloseTo(color.c, 5);
    expect(result.m).toBeCloseTo(color.m, 5);
    expect(result.y).toBeCloseTo(color.y, 5);
    expect(result.k).toBeCloseTo(color.k, 5);
    expect(result.alpha).toBe(1);
  });

  it('accepts a hex string', () => {
    expect(toCmyk('#ff0000')).toEqual(RED_CMYK);
  });

  it('accepts a device-cmyk() string', () => {
    expect(toCmyk('device-cmyk(0% 100% 100% 0%)')).toEqual(RED_CMYK);
  });
});
