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
  /**
   * The step at which the base color's exact lightness is placed. Steps below it interpolate
   * toward `lightnessMax`; steps above interpolate toward `lightnessMin`. Defaults to the
   * numeric midpoint of the steps range (500 in the default 50–950 scale).
   */
  anchorStep?: number;
}

type ComputeStepParams = {
  step: number;
  stepsMin: number;
  stepsMax: number;
  tAnchor: number;
  baseL: number;
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
  tAnchor,
  baseL,
  baseC,
  baseH,
  baseAlpha,
  lightnessRange,
  chromaRange,
}: ComputeStepParams): string {
  const t = (step - stepsMin) / (stepsMax - stepsMin);
  const [lMin, lMax] = lightnessRange;
  // Piecewise: interpolate lMax→baseL before the anchor, baseL→lMin after it.
  const l =
    t <= tAnchor
      ? lMax + (baseL - lMax) * (tAnchor > 0 ? t / tAnchor : 1)
      : baseL + (lMin - baseL) * ((t - tAnchor) / (1 - tAnchor));
  const [cMin, cMax] = chromaRange;
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
  const { l, c, h, alpha } = toOklch(baseColor);
  const stepsMin = Math.min(...steps);
  const stepsMax = Math.max(...steps);
  const anchorStepValue = options?.anchorStep ?? (stepsMin + stepsMax) / 2;
  const tAnchor = Math.max(0, Math.min(1, (anchorStepValue - stepsMin) / (stepsMax - stepsMin)));
  return Object.fromEntries(
    steps.map((step) => [
      step,
      computeStep({
        step,
        stepsMin,
        stepsMax,
        tAnchor,
        baseL: l,
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
export function generateColorPalettes<const T extends Record<string, string>>(
  colors: T,
  options?: ColorScaleOptions,
): { [K in keyof T]: Record<number, string> } {
  return Object.fromEntries(
    Object.entries(colors).map(([name, color]) => [name, generateColorScale(color, options)]),
  ) as { [K in keyof T]: Record<number, string> };
}

export interface ColorPaletteCSSOptions {
  /**
   * The color palettes to generate CSS for.
   *
   * @default {}
   * @see {@linkcode generateColorPalettes}
   */
  palettes?: Record<string, Record<number, string>>;

  /**
   * The prefix to use for the CSS custom properties.
   */
  prefix?: string;

  /**
   * Whether to generate CSS with [Tailwind CSS](https://tailwindcss.com/) v4 directives.
   *
   * @default false
   */
  tailwind?: boolean;
}

/**
 * Generate CSS custom properties for color palettes.
 */
export function generateColorPaletteCss(options?: ColorPaletteCSSOptions): string {
  const { palettes = {}, prefix = '', tailwind = false } = options ?? {};

  let css = '/* Generated Gud Color Palette */\n';
  css += '\n';

  if (tailwind) {
    css += '@theme {\n';
  } else {
    css += ':root {\n';
  }

  for (const [name, scale] of Object.entries(palettes)) {
    for (const [step, value] of Object.entries(scale)) {
      css += `  --${prefix}color-${name}-${step}: ${value};\n`;
    }
  }

  css += '}\n';

  return css;
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
