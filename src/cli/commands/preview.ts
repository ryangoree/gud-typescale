import { writeFileSync } from 'node:fs';
import { command } from '@gud/cli';
import {
  DEFAULT_TYPE_SCALE_HIERARCHY,
  generateColorPalettes,
  generatePreviewHtml,
  gudTypeScale,
  rounder,
  type TypeScaleUnit,
} from '#src/lib/index';

declare module '@gud/cli' {
  interface CustomOptionTypes {
    roundDirection: 'up' | 'down' | 'nearest';
    unit: TypeScaleUnit;
  }
}

export default command({
  description: 'Generate a self-contained HTML design system preview.',

  options: {
    colors: {
      alias: ['c'],
      description: 'Base colors in "name=hex" format (e.g. blue=#3b82f6). Omit to skip the color section.',
      type: 'array',
    },
    colorSteps: {
      description: 'Color scale steps to generate.',
      type: 'array',
      default: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    },
    lightnessMin: {
      description: 'Minimum OKLCH lightness (0–1).',
      type: 'number',
      default: 0.14,
    },
    lightnessMax: {
      description: 'Maximum OKLCH lightness (0–1).',
      type: 'number',
      default: 0.95,
    },
    chromaMin: {
      description: 'Minimum chroma multiplier (0–1).',
      type: 'number',
      default: 0.6,
    },
    chromaMax: {
      description: 'Maximum chroma multiplier (0–1).',
      type: 'number',
      default: 1.0,
    },
    hierarchy: {
      alias: ['h'],
      description: 'Hierarchy of font styles to generate.',
      type: 'array',
      default: [...DEFAULT_TYPE_SCALE_HIERARCHY],
    },
    base: {
      alias: ['b'],
      description: 'Base font size.',
      type: 'number',
      default: 16,
    },
    baseIndex: {
      alias: ['i'],
      description: 'Index of the base font size in the hierarchy.',
      type: 'number',
      default: 2,
    },
    multiplier: {
      alias: ['m'],
      description: 'Increment multiplier.',
      type: 'number',
      default: 2,
    },
    scaleSteps: {
      description: 'Steps between type scale multiples.',
      type: 'number',
      default: 5,
    },
    round: {
      alias: ['r'],
      description: 'Font size rounding factor.',
      type: 'number',
      default: '0.25',
    },
    roundDirection: {
      alias: ['d'],
      description: 'Rounding direction.',
      type: 'string',
      customType: 'roundDirection',
      choices: ['up', 'down', 'nearest'],
      default: 'up',
    },
    gridHeight: {
      alias: ['g'],
      description: 'Line height grid size.',
      type: 'number',
      default: 8,
    },
    lineHeightMultiplier: {
      alias: ['l'],
      description: 'Line height multiplier.',
      type: 'number',
      default: 1.3,
    },
    unit: {
      alias: ['u'],
      description: 'CSS unit for font sizes and line heights.',
      type: 'string',
      customType: 'unit',
      choices: ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'rem'],
      default: 'rem',
    },
    prefix: {
      alias: ['p'],
      description: 'Prefix for CSS custom properties and utility classes.',
      type: 'string',
    },
    tailwind: {
      alias: ['t'],
      description: 'Show Tailwind CSS v4 variable names in the preview.',
      type: 'boolean',
      default: false,
    },
    output: {
      alias: ['o'],
      description: 'Output file path.',
      type: 'string',
      default: 'preview.html',
      required: true,
    },
  },

  handler: async ({ options }) => {
    const colors = await options.colors();
    const colorSteps = await options.colorSteps();
    const lightnessMin = await options.lightnessMin();
    const lightnessMax = await options.lightnessMax();
    const chromaMin = await options.chromaMin();
    const chromaMax = await options.chromaMax();
    const hierarchy = await options.hierarchy();
    const base = await options.base();
    const baseIndex = await options.baseIndex();
    const multiplier = await options.multiplier();
    const scaleSteps = await options.scaleSteps();
    const round = await options.round();
    const roundDirection = await options.roundDirection();
    const gridHeight = await options.gridHeight();
    const lineHeightMultiplier = await options.lineHeightMultiplier();
    const unit = await options.unit();
    const prefix = await options.prefix();
    const tailwind = await options.tailwind();
    const output = await options.output();

    const parsedColors = colors
      ? Object.fromEntries(
          colors.map((entry) => {
            const eq = entry.indexOf('=');
            return [entry.slice(0, eq), entry.slice(eq + 1)];
          }),
        )
      : {};

    const parsedColorSteps = colorSteps.map(Number);

    const typeScale = gudTypeScale({
      hierarchy,
      base,
      baseIndex,
      multiplier,
      steps: scaleSteps,
      round: round ? rounder(round, roundDirection) : undefined,
      gridHeight,
      lineHeightMultiplier,
      unit,
    });

    const palettes =
      Object.keys(parsedColors).length > 0
        ? generateColorPalettes(parsedColors, {
            steps: parsedColorSteps,
            lightnessRange: [lightnessMin, lightnessMax],
            chromaRange: [chromaMin, chromaMax],
          })
        : {};

    const html = generatePreviewHtml({
      typeScale,
      palettes,
      colorSteps: parsedColorSteps,
      prefix,
      tailwind,
    });

    writeFileSync(output, html, 'utf8');
    console.log(`✅ Design system preview saved to ${output}`);
  },
});
