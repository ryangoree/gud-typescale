import { writeFileSync } from 'node:fs';
import { command } from '@gud/cli';
import { roundDirectionChoices, unitChoices } from '#src/cli/customTypes';
import {
  DEFAULT_TYPE_SCALE_HIERARCHY,
  generateColorPaletteCss,
  generateColorPalettes,
  generatePreviewHtml,
  gudTypeScale,
  gudTypeScaleCss,
  rounder,
} from '#src/lib';

export default command({
  description:
    'Generate a complete design system — type scale CSS, color palette CSS, and optionally an HTML preview.',

  options: {
    // ── Color ──────────────────────────────────────────────────────────
    colors: {
      alias: ['c'],
      description:
        'Base colors in "name=hex" format (e.g. blue=#3b82f6). Omit to skip color output.',
      type: 'array',
    },
    colorSteps: {
      description: 'Color scale steps to generate.',
      type: 'array',
      default: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    },
    lightnessMin: {
      description: 'Minimum OKLCH lightness (0-1).',
      type: 'number',
      default: 0.14,
    },
    lightnessMax: {
      description: 'Maximum OKLCH lightness (0-1).',
      type: 'number',
      default: 0.95,
    },
    chromaMin: {
      description: 'Minimum chroma multiplier (0-1).',
      type: 'number',
      default: 0.6,
    },
    chromaMax: {
      description: 'Maximum chroma multiplier (0-1).',
      type: 'number',
      default: 1.0,
    },
    colorOutput: {
      description: 'Output file path for the color palette CSS.',
      type: 'string',
      default: 'color-palette.css',
    },

    // ── Type scale ─────────────────────────────────────────────────────
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
      alias: ['s'],
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
      choices: roundDirectionChoices,
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
      choices: unitChoices,
      default: 'rem',
    },
    typeScaleOutput: {
      description: 'Output file path for the type scale CSS.',
      type: 'string',
      default: 'typescale.css',
    },

    // ── Shared ─────────────────────────────────────────────────────────
    prefix: {
      alias: ['p'],
      description: 'Prefix for CSS custom properties.',
      type: 'string',
    },
    tailwind: {
      alias: ['t'],
      description: 'Generate CSS with Tailwind CSS v4 directives.',
      type: 'boolean',
      default: false,
    },

    // ── Preview ────────────────────────────────────────────────────────
    preview: {
      description: 'Also generate an HTML design system preview.',
      type: 'boolean',
      default: false,
    },
    previewUnit: {
      description:
        'Unit used to display font-size and line-height values in the preview. Defaults to the type scale unit.',
      type: 'string',
      customType: 'unit',
      choices: unitChoices,
    },
    previewOutput: {
      alias: ['o'],
      description: 'Output file path for the HTML preview.',
      type: 'string',
      default: 'preview.html',
    },
  },

  handler: async ({ options }) => {
    const colors = await options.colors();
    const colorSteps = await options.colorSteps();
    const lightnessMin = await options.lightnessMin();
    const lightnessMax = await options.lightnessMax();
    const chromaMin = await options.chromaMin();
    const chromaMax = await options.chromaMax();
    const colorOutput = await options.colorOutput();

    const hierarchy = await options.hierarchy();
    const base = await options.base();
    const baseIndex = await options.baseIndex();
    const multiplier = await options.multiplier();
    const steps = await options.scaleSteps();
    const round = await options.round();
    const roundDirection = await options.roundDirection();
    const gridHeight = await options.gridHeight();
    const lineHeightMultiplier = await options.lineHeightMultiplier();
    const unit = await options.unit();
    const typeScaleOutput = await options.typeScaleOutput();

    const prefix = await options.prefix();
    const tailwind = await options.tailwind();

    const preview = await options.preview();
    const previewUnit = await options.previewUnit();
    const previewOutput = await options.previewOutput();

    const parsedColorSteps = colorSteps.map(Number);

    const parsedColors = colors
      ? Object.fromEntries(
          colors.map((entry) => {
            const eq = entry.indexOf('=');
            return [entry.slice(0, eq), entry.slice(eq + 1)];
          }),
        )
      : undefined;

    const typeScale = gudTypeScale({
      hierarchy,
      base,
      baseIndex,
      multiplier,
      steps,
      round: round ? rounder(round, roundDirection) : undefined,
      gridHeight,
      lineHeightMultiplier,
      unit,
    });

    const palettes =
      parsedColors !== undefined
        ? generateColorPalettes(parsedColors, {
            steps: parsedColorSteps,
            lightnessRange: [lightnessMin, lightnessMax],
            chromaRange: [chromaMin, chromaMax],
          })
        : undefined;

    writeFileSync(typeScaleOutput, gudTypeScaleCss({ typeScale, prefix, tailwind }), 'utf8');
    console.log(`✅ Type scale CSS saved to ${typeScaleOutput}`);

    if (palettes !== undefined) {
      writeFileSync(colorOutput, generateColorPaletteCss({ palettes, prefix, tailwind }), 'utf8');
      console.log(`✅ Color palette CSS saved to ${colorOutput}`);
    }

    if (preview) {
      writeFileSync(
        previewOutput,
        generatePreviewHtml({
          typeScale,
          palettes: palettes ?? {},
          colorSteps: parsedColorSteps,
          prefix,
          tailwind,
          previewUnit,
          base,
        }),
        'utf8',
      );
      console.log(`✅ Design system preview saved to ${previewOutput}`);
    }
  },
});
