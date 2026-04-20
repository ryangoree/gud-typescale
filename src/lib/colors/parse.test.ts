import { describe, expect, it } from 'vitest';
import { parseColor } from '#src/lib/colors/parse';

describe('parseColor', () => {
  // Hex strings

  it('parses a 6-digit hex string to RGB', () => {
    expect(parseColor('#ff0000')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 1 },
    });
  });

  it('parses a 3-digit hex string to RGB', () => {
    expect(parseColor('#f00')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 1 },
    });
  });

  it('parses an 8-digit hex string to RGB with alpha', () => {
    expect(parseColor('#ff000080')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 0x80 / 255 },
    });
  });

  // rgb() / rgba()

  it('parses a space-separated rgb() string to RGB', () => {
    expect(parseColor('rgb(255 0 0)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 1 },
    });
  });

  it('parses a comma-separated rgb() string to RGB', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 1 },
    });
  });

  it('parses an rgba() string to RGB', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 0.5 },
    });
  });

  it('parses an rgb() string with percentage channel values to RGB', () => {
    expect(parseColor('rgb(100% 0% 0%)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 1 },
    });
  });

  it('parses an rgb() string with slash-separated alpha to RGB', () => {
    expect(parseColor('rgb(255 0 0 / 0.5)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 0.5 },
    });
  });

  it('parses an rgb() string with percentage alpha to RGB', () => {
    expect(parseColor('rgb(255 0 0 / 50%)')).toEqual({
      format: 'rgb',
      color: { r: 1, g: 0, b: 0, alpha: 0.5 },
    });
  });

  // oklab()

  it('parses an oklab() string to OKLAB', () => {
    expect(parseColor('oklab(0.5 0.1 0.2)')).toEqual({
      format: 'oklab',
      color: { l: 0.5, a: 0.1, b: 0.2, alpha: 1 },
    });
  });

  it('parses an oklab() string with percentage values to OKLAB', () => {
    // L: 100% = 1, a/b: 100% = 0.4
    expect(parseColor('oklab(50% 25% 50%)')).toEqual({
      format: 'oklab',
      color: { l: 0.5, a: 0.1, b: 0.2, alpha: 1 },
    });
  });

  it('parses an oklab() string with alpha to OKLAB', () => {
    expect(parseColor('oklab(0.5 0.1 0.2 / 0.5)')).toEqual({
      format: 'oklab',
      color: { l: 0.5, a: 0.1, b: 0.2, alpha: 0.5 },
    });
  });

  // oklch()

  it('parses an oklch() string to OKLCH', () => {
    expect(parseColor('oklch(0.5 0.2 120)')).toEqual({
      format: 'oklch',
      color: { l: 0.5, c: 0.2, h: 120, alpha: 1 },
    });
  });

  it('parses an oklch() string with percentage values to OKLCH', () => {
    // L: 100% = 1, C: 100% = 0.4
    expect(parseColor('oklch(50% 50% 120)')).toEqual({
      format: 'oklch',
      color: { l: 0.5, c: 0.2, h: 120, alpha: 1 },
    });
  });

  it('parses an oklch() string with alpha to OKLCH', () => {
    expect(parseColor('oklch(0.5 0.2 120 / 0.5)')).toEqual({
      format: 'oklch',
      color: { l: 0.5, c: 0.2, h: 120, alpha: 0.5 },
    });
  });

  // hsl() / hsla()

  it('parses a space-separated hsl() string to HSL', () => {
    expect(parseColor('hsl(120 75% 25%)')).toEqual({
      format: 'hsl',
      color: { h: 120, s: 0.75, l: 0.25, alpha: 1 },
    });
  });

  it('parses a comma-separated hsla() string to HSL', () => {
    expect(parseColor('hsla(240, 100%, 50%, 0.5)')).toEqual({
      format: 'hsl',
      color: { h: 240, s: 1, l: 0.5, alpha: 0.5 },
    });
  });

  it('parses an hsl() string with slash-separated alpha to HSL', () => {
    expect(parseColor('hsl(120 75% 25% / 0.5)')).toEqual({
      format: 'hsl',
      color: { h: 120, s: 0.75, l: 0.25, alpha: 0.5 },
    });
  });

  it('parses an hsl() string with a deg hue to HSL', () => {
    expect(parseColor('hsl(120deg 75% 25%)')).toEqual({
      format: 'hsl',
      color: { h: 120, s: 0.75, l: 0.25, alpha: 1 },
    });
  });

  it('parses an hsl() string with a none hue to HSL, treating none as 0', () => {
    expect(parseColor('hsl(none 75% 25%)')).toEqual({
      format: 'hsl',
      color: { h: 0, s: 0.75, l: 0.25, alpha: 1 },
    });
  });

  // device-cmyk()

  it('parses a device-cmyk() string with percentage values to CMYK', () => {
    expect(parseColor('device-cmyk(0% 100% 100% 0%)')).toEqual({
      format: 'cmyk',
      color: { c: 0, m: 1, y: 1, k: 0, alpha: 1 },
    });
  });

  it('parses a device-cmyk() string with number values to CMYK', () => {
    expect(parseColor('device-cmyk(0 1 1 0)')).toEqual({
      format: 'cmyk',
      color: { c: 0, m: 1, y: 1, k: 0, alpha: 1 },
    });
  });

  it('parses a device-cmyk() string with alpha to CMYK', () => {
    expect(parseColor('device-cmyk(0 1 1 0 / 0.5)')).toEqual({
      format: 'cmyk',
      color: { c: 0, m: 1, y: 1, k: 0, alpha: 0.5 },
    });
  });

  // Object passthrough

  it('passes through an RGB object', () => {
    const color = { r: 0.5, g: 0.25, b: 0.75, alpha: 1 };
    expect(parseColor(color)).toEqual({ format: 'rgb', color });
  });

  it('passes through an OKLAB object', () => {
    const color = { l: 0.5, a: 0.1, b: 0.2, alpha: 1 };
    expect(parseColor(color)).toEqual({ format: 'oklab', color });
  });

  it('passes through an OKLCH object', () => {
    const color = { l: 0.5, c: 0.2, h: 120, alpha: 1 };
    expect(parseColor(color)).toEqual({ format: 'oklch', color });
  });

  it('passes through an HSL object', () => {
    const color = { h: 120, s: 0.75, l: 0.25, alpha: 1 };
    expect(parseColor(color)).toEqual({ format: 'hsl', color });
  });

  it('passes through a CMYK object', () => {
    const color = { c: 0, m: 1, y: 1, k: 0, alpha: 1 };
    expect(parseColor(color)).toEqual({ format: 'cmyk', color });
  });

  // Error cases

  it('throws on an unsupported color string format', () => {
    expect(() => parseColor('hwb(194 0% 0%)')).toThrow();
  });

  it('throws on an invalid hex string', () => {
    expect(() => parseColor('#1234')).toThrow();
  });

  it('throws on an unsupported color object', () => {
    expect(() => parseColor({ x: 1, y: 2, z: 3 } as any)).toThrow();
  });
});
