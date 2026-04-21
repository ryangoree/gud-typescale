import { describe, expect, it } from 'vitest';
import {
  gudColorPalettes,
  gudColorScale,
  interpolateOklch,
} from '#src/lib/colors/colorPaletteGenerator';
import { toOklch } from '#src/lib/colors/convert';

const RED = '#e11d48';
const BLUE = '#2563eb';

describe('generateColorScale', () => {
  it('returns an entry for each default step', () => {
    const scale = gudColorScale(RED);
    expect(Object.keys(scale).map(Number)).toEqual([
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ]);
  });

  it('returns valid hex strings', () => {
    const scale = gudColorScale(RED);
    for (const value of Object.values(scale)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('produces lighter colors at lower steps', () => {
    const scale = gudColorScale(RED);
    const l50 = toOklch(scale[50] as string).l;
    const l500 = toOklch(scale[500] as string).l;
    const l950 = toOklch(scale[950] as string).l;
    expect(l50).toBeGreaterThan(l500);
    expect(l500).toBeGreaterThan(l950);
  });

  it('respects custom steps', () => {
    const scale = gudColorScale(RED, { steps: [100, 200, 300] });
    expect(Object.keys(scale).map(Number)).toEqual([100, 200, 300]);
  });

  it('produces the same values for existing steps when a new step is inserted', () => {
    const before = gudColorScale(RED, { steps: [50, 100, 200, 300] });
    const after = gudColorScale(RED, { steps: [50, 100, 150, 200, 300] });
    expect(after[50]).toBe(before[50]);
    expect(after[100]).toBe(before[100]);
    expect(after[200]).toBe(before[200]);
    expect(after[300]).toBe(before[300]);
  });

  it('new inserted step falls between its neighbors in lightness', () => {
    const scale = gudColorScale(RED, { steps: [50, 100, 150, 200] });
    const l100 = toOklch(scale[100] as string).l;
    const l150 = toOklch(scale[150] as string).l;
    const l200 = toOklch(scale[200] as string).l;
    expect(l150).toBeLessThan(l100);
    expect(l150).toBeGreaterThan(l200);
  });

  it('respects custom lightnessRange', () => {
    const defaultScale = gudColorScale(RED);
    const widerScale = gudColorScale(RED, { lightnessRange: [0.05, 0.98] });
    const defaultL50 = toOklch(defaultScale[50] as string).l;
    const widerL50 = toOklch(widerScale[50] as string).l;
    const defaultL950 = toOklch(defaultScale[950] as string).l;
    const widerL950 = toOklch(widerScale[950] as string).l;
    expect(widerL50).toBeGreaterThan(defaultL50);
    expect(widerL950).toBeLessThan(defaultL950);
  });

  it('throws on invalid color', () => {
    expect(() => gudColorScale('not-a-color')).toThrow();
  });
});

describe('generateColorPalettes', () => {
  it('generates a scale for each named color', () => {
    const palettes = gudColorPalettes({ red: RED, blue: BLUE });
    expect(Object.keys(palettes)).toEqual(['red', 'blue']);
    expect(Object.keys(palettes.red as object).map(Number)).toEqual([
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ]);
  });

  it('passes options to each scale', () => {
    const palettes = gudColorPalettes({ red: RED }, { steps: [100, 500, 900] });
    expect(Object.keys(palettes.red as object).map(Number)).toEqual([100, 500, 900]);
  });
});

describe('interpolateOklch', () => {
  it('returns a valid hex at t=0.5', () => {
    expect(interpolateOklch(RED, BLUE)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('midpoint lightness falls between the two inputs', () => {
    const lRed = toOklch(RED).l;
    const lBlue = toOklch(BLUE).l;
    const lMid = toOklch(interpolateOklch(RED, BLUE)).l;
    const lMin = Math.min(lRed, lBlue);
    const lMax = Math.max(lRed, lBlue);
    expect(lMid).toBeGreaterThanOrEqual(lMin);
    expect(lMid).toBeLessThanOrEqual(lMax);
  });
});
