import { describe, expect, it } from 'vitest';
import { formatColor } from '#src/lib/colors/format';

describe('formatColor', () => {
  // RGB

  it('formats an RGB color as a CSS rgb() string', () => {
    expect(formatColor({ r: 1, g: 0, b: 0, alpha: 1 })).toBe('rgb(255 0 0)');
  });

  it('formats an RGB color with fractional channels', () => {
    expect(formatColor({ r: 0.5, g: 0.25, b: 0.75, alpha: 1 })).toBe('rgb(128 64 191)');
  });

  it('includes alpha in the RGB string when less than 1', () => {
    expect(formatColor({ r: 1, g: 0, b: 0, alpha: 0.5 })).toBe('rgb(255 0 0 / 0.5)');
  });

  it('omits alpha from the RGB string when it is 1', () => {
    expect(formatColor({ r: 1, g: 0, b: 0, alpha: 1 })).not.toContain('/');
  });

  // OKLAB

  it('formats an OKLAB color as a CSS oklab() string', () => {
    expect(formatColor({ l: 0.5, a: 0.1, b: 0.2, alpha: 1 })).toBe('oklab(0.5 0.1 0.2)');
  });

  it('includes alpha in the oklab() string when less than 1', () => {
    expect(formatColor({ l: 0.5, a: 0.1, b: 0.2, alpha: 0.5 })).toBe('oklab(0.5 0.1 0.2 / 0.5)');
  });

  it('omits alpha from the oklab() string when it is 1', () => {
    expect(formatColor({ l: 0.5, a: 0.1, b: 0.2, alpha: 1 })).not.toContain('/');
  });

  // OKLCH

  it('formats an OKLCH color as a CSS oklch() string', () => {
    expect(formatColor({ l: 0.5, c: 0.2, h: 120, alpha: 1 })).toBe('oklch(0.5 0.2 120)');
  });

  it('includes alpha in the oklch() string when less than 1', () => {
    expect(formatColor({ l: 0.5, c: 0.2, h: 120, alpha: 0.5 })).toBe('oklch(0.5 0.2 120 / 0.5)');
  });

  it('omits alpha from the oklch() string when it is 1', () => {
    expect(formatColor({ l: 0.5, c: 0.2, h: 120, alpha: 1 })).not.toContain('/');
  });

  // HSL

  it('formats an HSL color as a CSS hsl() string', () => {
    expect(formatColor({ h: 120, s: 0.75, l: 0.25, alpha: 1 })).toBe('hsl(120 75% 25%)');
  });

  it('formats an HSL color with h=0 (red)', () => {
    expect(formatColor({ h: 0, s: 1, l: 0.5, alpha: 1 })).toBe('hsl(0 100% 50%)');
  });

  it('includes alpha in the hsl() string when less than 1', () => {
    expect(formatColor({ h: 240, s: 1, l: 0.5, alpha: 0.5 })).toBe('hsl(240 100% 50% / 0.5)');
  });

  it('omits alpha from the hsl() string when it is 1', () => {
    expect(formatColor({ h: 120, s: 0.75, l: 0.25, alpha: 1 })).not.toContain('/');
  });

  // CMYK

  it('formats a CMYK color as a CSS device-cmyk() string', () => {
    expect(formatColor({ c: 0, m: 1, y: 1, k: 0, alpha: 1 })).toBe('device-cmyk(0% 100% 100% 0%)');
  });

  it('formats a CMYK color with fractional channel values', () => {
    expect(formatColor({ c: 0.25, m: 0.5, y: 0.75, k: 0, alpha: 1 })).toBe(
      'device-cmyk(25% 50% 75% 0%)',
    );
  });

  it('includes alpha in the device-cmyk() string when less than 1', () => {
    expect(formatColor({ c: 0, m: 1, y: 1, k: 0, alpha: 0.5 })).toBe(
      'device-cmyk(0% 100% 100% 0% / 0.5)',
    );
  });

  it('omits alpha from the device-cmyk() string when it is 1', () => {
    expect(formatColor({ c: 0, m: 1, y: 1, k: 0, alpha: 1 })).not.toContain('/');
  });
});
