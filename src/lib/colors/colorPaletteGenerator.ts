import { toHex, toOklch } from '#src/lib/colors/convert';

const DEFAULT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const DEFAULT_LIGHTNESS_RANGE: [number, number] = [0.14, 0.95];
const DEFAULT_CHROMA_RANGE: [number, number] = [0.6, 1.0];

export interface ColorScaleOptions {
  /** Step values to generate. Default: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] */
  steps?: number[];
  /** OKLCH lightness range [min, max] (0–1). Default: [0.14, 0.95] */
  lightnessRange?: [number, number];
  /** Chroma multiplier bell-curve range [min, max]. Default: [0.6, 1.0] */
  chromaRange?: [number, number];
}

type ComputeStepParams = {
  step: number;
  stepsMin: number;
  stepsMax: number;
  baseC: number;
  baseH: number;
  baseAlpha: number;
  lightnessRange: [number, number];
  chromaRange: [number, number];
};

function computeStep({
  step,
  stepsMin,
  stepsMax,
  baseC,
  baseH,
  baseAlpha,
  lightnessRange,
  chromaRange,
}: ComputeStepParams): string {
  const t = (step - stepsMin) / (stepsMax - stepsMin);
  const [lMin, lMax] = lightnessRange;
  const [cMin, cMax] = chromaRange;
  const l = lMax - (lMax - lMin) * t;
  const chromaMult = cMin + (cMax - cMin) * Math.sin(Math.PI * t);
  return toHex({ l, c: baseC * chromaMult, h: baseH, alpha: baseAlpha });
}

/** Generate a Tailwind-style hex color scale from a single base color. */
export function generateColorScale(
  baseColor: string,
  options?: ColorScaleOptions,
): Record<number, string> {
  const {
    steps = DEFAULT_STEPS,
    lightnessRange = DEFAULT_LIGHTNESS_RANGE,
    chromaRange = DEFAULT_CHROMA_RANGE,
  } = options ?? {};
  const { c, h, alpha } = toOklch(baseColor);
  const stepsMin = Math.min(...steps);
  const stepsMax = Math.max(...steps);
  return Object.fromEntries(
    steps.map((step) => [
      step,
      computeStep({
        step,
        stepsMin,
        stepsMax,
        baseC: c,
        baseH: h,
        baseAlpha: alpha,
        lightnessRange,
        chromaRange,
      }),
    ]),
  );
}

/** Generate Tailwind-style hex color scales for multiple named colors. */
export function generateColorPalettes(
  colors: Record<string, string>,
  options?: ColorScaleOptions,
): Record<string, Record<number, string>> {
  return Object.fromEntries(
    Object.entries(colors).map(([name, color]) => [name, generateColorScale(color, options)]),
  );
}

/** Linearly interpolate between two colors in OKLCH space. */
export function interpolateOklch(colorA: string, colorB: string, t = 0.5): string {
  const a = toOklch(colorA);
  const b = toOklch(colorB);
  return toHex({
    l: a.l + t * (b.l - a.l),
    c: a.c + t * (b.c - a.c),
    h: a.h + t * (b.h - a.h),
    alpha: a.alpha + t * (b.alpha - a.alpha),
  });
}
